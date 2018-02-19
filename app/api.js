import byteSize from 'byte-size'
import ipfsAPI from 'ipfs-api'
import { join } from 'path'
import { createWriteStream, mkdirSync } from 'fs'

import { getMultiAddrIPFSDaemon } from './daemon'

const ERROR_IPFS_UNAVAILABLE = 'IPFS NOT AVAILABLE'

let IPFS_CLIENT = null

export function startIPFS () {
  if (IPFS_CLIENT !== null) return Promise.resolve(IPFS_CLIENT)

  const apiMultiaddr = getMultiAddrIPFSDaemon()
  IPFS_CLIENT = ipfsAPI(apiMultiaddr)
  window.ipfs = IPFS_CLIENT
  return Promise.resolve(IPFS_CLIENT)
}

/**
 * This function will allow the user to add a file to the IPFS repo.
 */
export function addFileFromFSPath (filePath) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const options = { recursive: true }
  return IPFS_CLIENT.util.addFromFs(filePath, options)
}

/**
 * This function will allow the user to unpin an object from the IPFS repo.
 * Used to remove the file from the repo, if combined with the GC.
 */
export function unpinObject (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const options = { recursive: true }
  return IPFS_CLIENT.pin.rm(hash, options)
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
      stats.RepoSize = byteSize(stats.RepoSize)
      return Promise.resolve(stats)
    })
}

/**
 * Provides a Promise that will resolve the peers list (in the future that can
 * be manipualted)
 */
export function getPeersInfo () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.swarm.peers()
}

/**
 * Provides a Promise that will resolve the peer info (id, pubkye etc..)
 */
export function getPeer () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.id()
}

/**
 * Provide a Promise that will resolve into the Pin's object, with an hash key
 * containing its hash.
 */
export function getObjectList () {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.pin.ls()
}

/**
 * Provides using a Promise the stat of an IPFS object. Note: All the Size
 * values are a byteSize object (ex: {value, unit}) to make it human readable
 */
export function getObjectStat (objectMultiHash) {
  return new Promise((resolve, reject) => {
    if (!IPFS_CLIENT) return reject(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.object.stat(objectMultiHash)
      .then((stat) => {
        stat.BlockSize = byteSize(stat.BlockSize)
        stat.LinksSize = byteSize(stat.LinksSize)
        stat.DataSize = byteSize(stat.DataSize)
        stat.CumulativeSize = byteSize(stat.CumulativeSize)
        return resolve(stat)
      })
      .catch(reject)
  })
}

/**
 * Provides using a Promise the serialized dag of an IPFS object.
 */
export function getObjectDag (objectMultiHash) {
  return new Promise((resolve, reject) => {
    if (!IPFS_CLIENT) return reject(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.object.get(objectMultiHash)
      .then((dag) => {
        dag = dag.toJSON()
        dag.size = byteSize(dag.size)
        dag.links = dag.links.map(link => {
          link.size = byteSize(link.size)
          return link
        })

        return resolve(dag)
      })
      .catch(reject)
  })
}

/**
 * Returns a Promise that resolves a fully featured StorageList with more
 * details, ex: Sizes, Links, Hash, Data. Used by the Interface to render the table
 */
export function getStorageList () {
  return new Promise((resolve, reject) => getObjectList()
      // Now obtain the object data
      .then(pins => {
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
              pin.isDirectory = dag.data.length === 2 && dag.data.toString() === '\u0008\u0001'
              return Promise.resolve(pin)
            })
        })

        // Return a promise that will complete when all the data will be
        // available. When done, it will run the main promise success()
        return Promise.all(promises).then(resolve, reject)
      })
      .catch(reject))
}

/**
 * This function will return a promise that wants to provide the peers that
 * are owning a specific hash.
 */
export function getPeersWithObjectbyHash (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  return IPFS_CLIENT.dht.findprovs(hash)
}

/**
 * importObjectByHash will "import" an object recursively, by pinning it to the
 * repository.
 */
export function importObjectByHash (hash) {
  if (!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  const options = { recursive: true }
  return IPFS_CLIENT.pin.add(hash, options)
}

/**
 * This function allows to save on FS the content of an object to a specific
 * path.
 *
 * See: https://github.com/ipfs/interface-ipfs-core/tree/master/API/files#get
 */
export function saveFileToPath (hash, dest) {
  return new Promise((resolve, reject) => {
    if (!IPFS_CLIENT) return reject(ERROR_IPFS_UNAVAILABLE)

    const stream = IPFS_CLIENT.files.getReadableStream(hash)

    stream.on('data', (file) => {
      const finalDest = join(dest, file.path)

      // First make all the directories
      if (!file.content) {
        mkdirSync(finalDest)
      } else {
        // Pipe the file content into an actual write stream
        const writeStream = createWriteStream(finalDest)
        file.content.pipe(writeStream)
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
}
