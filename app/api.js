import byteSize from 'byte-size'
import ipfsAPI from 'ipfs-api'
import { join, parse } from 'path'
import { createWriteStream, mkdirSync, statSync } from 'fs'
import multiaddr from 'multiaddr'
import request from 'request-promise-native'
import pjson from '../package.json'
import gateways from './gateways.json'
import { trackEvent } from './stats'

import Settings from 'electron-settings'
import { reportAndReject } from './lib/report/util'
import uuidv4 from 'uuid/v4'

export const ACTIVITIES_WINDOW_THRESHOLD = 16 * 1000 * 1000 // 16 MB
export const ERROR_IPFS_UNAVAILABLE = 'IPFS NOT AVAILABLE'
export const ERROR_IPFS_TIMEOUT = 'TIMEOUT'
let IPFS_CLIENT = null

const USER_AGENT = `Orion/${pjson.version}`

export function setClientInstance (client) {
  IPFS_CLIENT = client
}

const electron = require('electron')
const remote = electron.remote
const app = remote ? remote.app : electron.app
/**
 * initIPFSClient will set up a new ipfs-api instance. It will try to get
 * the configuration (api endpoint) from global vars
 *
 * @returns Promise<IPFS_CLIENT>
 */
export function initIPFSClient () {
  if (IPFS_CLIENT !== null) return Promise.resolve(IPFS_CLIENT)

  // Configure the endpoint for the api. It will try to get the value from the
  // global variables IPFS_MULTIADDR_APIs
  let apiMultiaddr
  if (remote) {
    apiMultiaddr = remote.getGlobal('IPFS_MULTIADDR_API')
  } else if (global.IPFS_MULTIADDR_API) {
    apiMultiaddr = global.IPFS_MULTIADDR_API
  }

  // this fails because of the repo lock
  setClientInstance(ipfsAPI(apiMultiaddr))
  return Promise.resolve(IPFS_CLIENT)
}

/**
 * Wrap the given files/links under a directory.
 *
 * ```
 * Link {
 *  hash: string;
 *  path: string;
 *  size: number;
 * }
 * ```
 *
 * @param {Link[]} links the files to be included in the wrapper
 * @returns {Link} the wrapper, which is of type Link
 */
export function wrapFiles (links) {
  const wrapperDAG = {
    Data: Buffer.from('\u0008\u0001'),
    // The object.put API expects `Name` not `path`
    Links: links.map(link => ({
      Name: link.path,
      Hash: link.hash,
      Size: link.size
    }))
  }

  return IPFS_CLIENT.object.put(wrapperDAG)
    .then(res => {
      // res is of type DAGNode
      // https://github.com/ipld/js-ipld-dag-pb#nodetojson
      res = res.toJSON()
      const wrapper = {
        hash: res.multihash,
        path: '',
        size: res.size
      }

      return wrapper
    })
    .catch(reportAndReject)
}

/**
 * This function will allow the user to add a file or multiple files to the IPFS repo.
 * Accepts a string or a string array.
 * Wraps the files in a directory.
 *
 * ```
 * Wrapper {
 *  hash: string;
 *  path: string;
 *  size: number;
 * }
 * ```
 *
 * @param {string[]} filePaths
 * @returns {Promise<Wrapper>} promise resolving with the wrapper
 */
export function addFilesFromFSPath (filePaths, _queryGateways = queryGateways) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  trackEvent('addFilesFromFSPath', { count: filePaths.length })

  const promises = filePaths.map(path => {
    const size = statSync(path).size
    const filename = parse(path).base
    const uuid = uuidv4()

    // when uploading big files we want to show the progress in the activities window
    if (size >= ACTIVITIES_WINDOW_THRESHOLD) {
      app.emit('show-activities-window')
    }

    /**
     * The fuction we pass under `progress` will be called with the byte length of chunks
     * as they are added to IPFS
     */
    const options = {
      recursive: true,
      progress: (progress) => {
        app.emit('patch-activity', {
          uuid,
          /**
           * {
           *   bytes: 2200,
           *   value: 2.2,
           *   unit: 'kB'
           * }
           */
          progress: {
            bytes: progress,
            ...byteSize(progress)
          }
        })
      }
    }

    app.emit('new-activity', {
      uuid,
      path,
      filename,
      type: 'add',
      size: {
        bytes: size,
        ...byteSize(size)
      },
      progress: 0
    })

    return IPFS_CLIENT.util.addFromFs(path, options)
  })

  return Promise.all(promises)
    .then(fileUploadResults => {
      // IPFS_CLIENT.util.addFromFs always returns an array
      // (because it can upload an dir recursively),
      // which is why we expect an array of arrays

      const rootFiles = fileUploadResults.map(result => {
        /**
         * If it was a directory it will be last
         * Example result:
         * [{
         *   hash: "QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtuEfL"
         *   path: "ipfs-test-dir/wrappedtext.txt"
         *   size: 15
         * }, {
         *   hash: "QmcysLdK6jV4QAgcdxVZFzTt8TieH4bkyW6kniPKTr2RXp"
         *   path: "ipfs-test-dir"
         *   size: 9425451
         * }]
         *
         */
        return result[result.length - 1]
      })

      return wrapFiles(rootFiles)
        .then(wrapper => Promise.all([
          // This value is needed further in the chain
          wrapper,
          // Pin the wrapper directory
          IPFS_CLIENT.pin.add(wrapper.hash),
          // Unpin the initial uploads
          ...rootFiles.map(rootFile => IPFS_CLIENT.pin.rm(rootFile.hash))
        ]))
        /**
         * Query the gateways and return the wrapper dir
         */
        .then(results => {
          const wrapper = results[0]

          if (!Settings.getSync('skipGatewayQuery')) {
            // Query all the uploaded files
            fileUploadResults.forEach(files => files.forEach(file => _queryGateways(file.hash)))
            // Query the wrapper
            _queryGateways(wrapper.hash)
          }

          return Promise.resolve(wrapper)
        })
    })
    .catch(reportAndReject)
}

/**
 * Query the gateways to help content propagation and
 * ensure that the file is available in the network.
 */
export function queryGateways (hash) {
  gateways.forEach(gateway => {
    request({
      uri: `${gateway}/${hash}`,
      headers: { 'User-Agent': USER_AGENT }
    })
      .catch(err => console.error(`Could not query ${gateway}. Error: ${err}`))
  })
}

/**
 * This function will allow the user to unpin an object from the IPFS repo.
 * Used to remove the file from the repo, if combined with the GC.
 */
export function unpinObject (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const options = { recursive: true }
  return IPFS_CLIENT.pin.rm(hash, options)
    .catch(reportAndReject)
}

/**
 * This function will allow the user to pin an object to the IPFS repo.
 * Used to prevent the Garbage collector from removing it.
 */
export function pinObject (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.pin.add(hash)
    .catch(reportAndReject)
}

/**
 * Provide a promise to get the Repository information. Its RepoSize is actually
 * a byteSize (ex: {value, unit}) to make it human readable
 */
export function getRepoInfo () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.repo.stat({ human: false })
    .then((stats) => {
      // Providing {value, unit} to the stats.RepoSize
      stats.RepoSize = byteSize(stats.repoSize)
      return Promise.resolve(stats)
    })
    .catch(reportAndReject)
}

/**
 * Provides a Promise that will resolve the peers list (in the future that can
 * be manipualted)
 */
export function getPeersInfo () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.swarm.peers()
    .catch(reportAndReject)
}

/**
 * Provides a Promise that will resolve the peer info (id, pubkye etc..)
 */
export function getPeer () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.id()
    .catch(reportAndReject)
}

/**
 * Provide a Promise that will resolve into the Pin's object, with an hash key
 * containing its hash.
 */
export function getObjectList () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.pin.ls()
    .catch(reportAndReject)
}

/**
 * Provides a Promise that will resolve with true if the hash is pinned
 * or resolve with false otherwise
 */
export function isObjectPinned (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.pin.ls()
    .then(pins => {
      // find returns the object, we need to cast it to boolean
      return Promise.resolve(!!pins.find(pin => pin.hash === hash))
    })
    .catch(reportAndReject)
}

/**
 * Provides using a Promise the stat of an IPFS object. Note: All the Size
 * values are a byteSize object (ex: {value, unit}) to make it human readable
 */
export function getObjectStat (objectMultiHash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.object.stat(objectMultiHash)
    .then((stat) => {
      stat.BlockSize = byteSize(stat.BlockSize)
      stat.LinksSize = byteSize(stat.LinksSize)
      stat.DataSize = byteSize(stat.DataSize)
      stat.CumulativeSize = byteSize(stat.CumulativeSize)
      return Promise.resolve(stat)
    })
    .catch(reportAndReject)
}

/**
 * Provides using a Promise the serialized dag of an IPFS object.
 */
export function getObjectDag (objectMultiHash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.object.get(objectMultiHash)
    .then((dag) => {
      dag = dag.toJSON()
      dag.size = byteSize(dag.size)
      dag.links = dag.links.map(link => {
        link.size = byteSize(link.size)
        return link
      })

      return Promise.resolve(dag)
    })
    .catch(reportAndReject)
}

/**
 * isDagDirectory will return a boolean value based on the content of the dag:
 * If it contains a IPFS "directory" structure, then returns true
 */
export function isDagDirectory (dag) {
  return dag.data.length === 2 && dag.data.toString() === '\u0008\u0001'
}

/**
 * Returns a Promise that resolves a fully featured StorageList with more
 * details, ex: Sizes, Links, Hash, Data. Used by the Interface to render the table
 */
export function getStorageList (pins) {
  // Filter out the indirect objects. Required to reduce API Calls
  pins = pins.filter(pin => pin.type !== 'indirect')

  // Get a list of promises that will return the pin object with the
  // stat and dag injected
  const promises = pins.map(pin => {
    // Use the promises to perform multiple injections, so always
    // resolve with the pin object
    return getObjectStat(pin.hash)
      .then(stat => {
        pin.stat = pin.stat || stat

        return getObjectDag(pin.hash)
      })
      .then(dag => {
        pin.dag = dag
        pin.isDirectory = isDagDirectory(dag)

        return Promise.resolve(pin)
      })
  })

  // Return a promise that will complete when all the data will be
  // available. When done, it will run the main promise success()
  return Promise.all(promises)
    .catch(reportAndReject)
}

/**
 * This function will return a promise that wants to provide the peers that
 * are owning a specific hash.
 */
export function getPeersWithObjectbyHash (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  return IPFS_CLIENT.dht.findprovs(hash)
    .catch(reportAndReject)
}

/**
 * importObjectByHash will "import" an object recursively, by pinning it to the
 * repository.
 */
export function importObjectByHash (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const options = { recursive: true }
  return IPFS_CLIENT.pin.add(hash, options)
    .catch(reportAndReject)
}

/**
 * This function allows to save on FS the content of an object to a specific
 * path.
 *
 * See: https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#get
 */
export function saveFileToPath (hash, dest) {
  // ToDo: Move this into a worker or exec `ipfs get` to prevent the UI from
  // hanging in case of large files.
  return new Promise((resolve, reject) => {
    if (!IPFS_CLIENT) return reject(ERROR_IPFS_UNAVAILABLE)

    const stream = IPFS_CLIENT.files.getReadableStream(hash)

    stream.on('data', (file) => {
      const finalDest = join(dest, file.path)

      // First make all the directories
      if (file.type === 'dir' || !file.content) {
        try {
          mkdirSync(finalDest)
        } catch (err) {
          if (err.code !== 'EEXIST') throw err
        }
      } else {
        // Pipe the file content into an actual write stream
        const writeStream = createWriteStream(finalDest)
        file.content.on('data', (data) => {
          writeStream.write(data)
        })
        file.content.resume()
      }
    })

    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

/**
 * This will just run the garbage collector to clean the repo for unused and
 * Unpinned objects.
 */
export function runGarbageCollector () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  return IPFS_CLIENT.repo.gc()
    .catch(reportAndReject)
}

/**
 * Resolves an IPNS name to an IPFS hash.
 */
export function resolveName (name) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.name.resolve(name)
    .catch(reportAndReject)
}

/**
 * Publishes an IPFS hash to IPNS (the PeerID).
 *
 * Result looks like:
 * {
 *  name:"QmPoXQhVxRAjMXLz7BaAAN1pQyKqHECK3K453oBRGnNvTQ"
 *  value:"/ipfs/QmPgcYEGLSBPJ8scQTsFRz8sz8X32cdZNQt3dSQb5fMMEQ"
 * }
 */
export function publishToIPNS (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.name.publish(hash)
    .catch(reportAndReject)
}

/**
 * connectTo allows easily to connect to a node by specifying a str multiaddress
 * example: connectTo("/ip4/192.168.0.22/tcp/4001/ipfs/Qm...")
 */
export function connectTo (strMultiddr) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const addr = multiaddr(strMultiddr)
  return IPFS_CLIENT.swarm.connect(addr)
    .catch(reportAndReject)
}

/**
 * promiseIPFSReady is a function that will waint and resolve the promise
 * only when the IPFS is accepting IPFS API. Reject after timeout in sec
 */
export function promiseIPFSReady (timeout, ipfsApiInstance) {
  timeout = timeout || 30 // defaults 30 secs
  ipfsApiInstance = ipfsApiInstance || IPFS_CLIENT // allows custom api
  let iID // interval id
  let trial = 0

  return new Promise((resolve, reject) => {
    iID = setInterval(() => {
      trial++
      if (trial >= timeout) {
        clearInterval(iID)
        return reject(ERROR_IPFS_TIMEOUT)
      }

      return getPeer().then(() => {
        clearInterval(iID)
        return resolve()
      }).catch(() => { }) // do nothing in case of errors
    }, 1000) // every second
  })
}
