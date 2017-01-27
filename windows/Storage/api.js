import byteSize from 'byte-size'
import ipfsAPI from 'ipfs-api'
import { getMultiAddrIPFSDaemon } from '../../app/daemon.js'

const ERROR_IPFS_UNAVAILABLE = "IPFS NOT AVAILABLE"

let IPFS_CLIENT = null

export function startIPFS(){
  return  new Promise( success => {
    if(IPFS_CLIENT != null) return success(IPFS_CLIENT)

    let api_multiaddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    IPFS_CLIENT = ipfsAPI(api_multiaddr)

    // Somehow this is not always working
    return success(IPFS_CLIENT)
  })
}

/**
 * get the Repository Statistics and provides the sizes
 */
export function getRepoInfo(){
  return new Promise((success, failure)=>{
    if(IPFS_CLIENT === undefined) return failure(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.repo.stat({human: true})
      .then((stats)=> {
        // Providing {value, unit} to the stats.RepoSize
        stats.RepoSize = byteSize(stats.RepoSize)
        return success(stats)
      }, failure)
  })
}

/**
 * This will get the UI about the connections stats (peers)
 */
export function getPeersInfo(){
  return new Promise((success, failure)=>{
    if(IPFS_CLIENT === undefined) return failure(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.swarm.peers()
      .then((peers)=> {
        return success(peers)
      }, failure)
  })
}

/**
 * This will get the UI with the list of Pinned Objects
 */
export function getObjectList(){
  return new Promise((success, failure)=>{
    if(IPFS_CLIENT === undefined) return failure(ERROR_IPFS_UNAVAILABLE)

    return IPFS_CLIENT.pin.ls()
      .then(pinsObj => {
        // Now we have pins, lets return an iterable array
        let pins = []
        for(let hash in pinsObj) {
          let new_obj = pinsObj[hash]
          new_obj.hash = new_obj.hash || hash
          pins.push(new_obj)
        }

        return success(pins)
      }, failure)
  })
}

/**
 * Return a promise containing the stats of an object
 */
export function getObjectStat(objectMultiHash){
  return new Promise((success, failure)=>{
    if(IPFS_CLIENT === undefined) return failure(ERROR_IPFS_UNAVAILABLE)

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

// PRovide the actual data combined (SIZE, STATS etc) as list of objects
export function getStorageList(){
  return new Promise((success, failure)=>{
    return getObjectList()
      // Now obtain the object data
      .then(pins => {
        // Get a list of promises that will return the pin object with the
        // stat injected
        let promises = pins.map(pin => {
          return new Promise( (pin_success) => {
            getObjectStat(pin.hash).then( stat => {
              pin.stat = pin.stat || stat
              pin_success(pin)
            })
          })
        })
        // Return a promise that will complete when all the data will be
        // available.
        Promise.all(promises).then(success, failure)
      })
  })
}