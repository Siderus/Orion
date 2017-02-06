import byteSize from 'byte-size'
import ipfsAPI from 'ipfs-api'
import { getMultiAddrIPFSDaemon } from './daemon'

const ERROR_IPFS_UNAVAILABLE = "IPFS NOT AVAILABLE"

let IPFS_CLIENT = null

export function startIPFS(){
  return  new Promise( success => {
    if(IPFS_CLIENT != null) return success(IPFS_CLIENT)

    let api_multiaddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    IPFS_CLIENT = ipfsAPI(api_multiaddr)
    window.ipfs = IPFS_CLIENT
    // Somehow this is not always working
    return success(IPFS_CLIENT)
  })
}

/**
 * This function will allow the user to add a file to the IPFS repo.
 */
export function addFileFromFSPath(filePath){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  let options = { recursive: true }
  return IPFS_CLIENT.util.addFromFs(filePath, options)
}

/**
 * This function will allow the user to unpin an object from the IPFS repo.
 * Used to remove the file from the repo, if combined with the GC.
 */
export function unpinObject(hash){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  let options = { recursive: true }
  return IPFS_CLIENT.pin.rm(hash, options)
}

/**
 * Provide a promise to get the Repository information. Its RepoSize is actually
 * a byteSize (ex: {value, unit}) to make it human readable
 */
export function getRepoInfo(){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.repo.stat({human: true})
    .then((stats)=> {
      // Providing {value, unit} to the stats.RepoSize
      stats.RepoSize = byteSize(stats.RepoSize)
      return Promise.resolve(stats)
    }, Promise.reject)
}

/**
 * Provides a Promise that will resolve the peers list (in the future that can
 * be manipualted)
 */
export function getPeersInfo(){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.swarm.peers()
}

/**
 * Provide a Promise that will resolve into the Pin's object, with an hash key
 * containing its hash.
 */
export function getObjectList(){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)

  return IPFS_CLIENT.pin.ls()
    .then(pinsObj => {
      // Now we have pins, lets return an iterable array
      let pins = []
      for(let hash in pinsObj) {
        let new_obj = pinsObj[hash]
        // Add the hash key
        new_obj.hash = new_obj.hash || hash
        pins.push(new_obj)
      }

      return Promise.resolve(pins)
    }, Promise.reject)
}

/**
 * Provides using a Promise the stat of an IPFS object. Note: All the Size
 * values are a byteSize object (ex: {value, unit}) to make it human readable
 */
export function getObjectStat(objectMultiHash){
  return new Promise((success, failure) => {
    if(!IPFS_CLIENT) return failure(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.object.stat(objectMultiHash)
      .then((stat)=> {
        stat.BlockSize = byteSize(stat.BlockSize)
        stat.LinksSize = byteSize(stat.LinksSize)
        stat.DataSize = byteSize(stat.DataSize)
        stat.CumulativeSize = byteSize(stat.CumulativeSize)
        return success(stat)
      }, failure)
  })
}

/**
 * Returns a Promise that resolves a fully featured StorageList with more
 * details, ex: Sizes, Links, Hash. Used by the Interface to render the table
 */
export function getStorageList(){
  return new Promise((success, failure) => {
    return getObjectList()
      // Now obtain the object data
      .then(pins => {
        // Filter out the indirect objects. Required to reduce API Calls
        pins = pins.filter(pin => pin.Type != "indirect")

        // Get a list of promises that will return the pin object with the
        // stat injected
        let promises = pins.map(pin => {
          return new Promise( (pin_success) => {
            // Use the promises to perform multiple injections, so always
            // resolve with the pin object
            getObjectStat(pin.hash)
              .then( stat => {
                pin.stat = pin.stat || stat
                return Promise.resolve(pin)
              })
              // Now let the pin's promise have a successfull life:
              .then(pin => pin_success(pin))
          })
        })

        // Return a promise that will complete when all the data will be
        // available. When done, it will run the main promise success()
        Promise.all(promises).then(success, failure)
      })
  })
}

/**
 * This function will return a promise that wants to provide the peers that
 * are owning a specific hash.
 */
export function getPeersWithObjectbyHash(hash){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  return IPFS_CLIENT.dht.findprovs(hash)
}


/**
 * importObjectByHash will "import" an object recursively, by pinning it to the
 * repository.
 */
export function importObjectByHash(hash){
  if(!IPFS_CLIENT) return Promise.reject(ERROR_IPFS_UNAVAILABLE)
  let options = { recursive: true }
  return IPFS_CLIENT.pin.add(hash, options)
}