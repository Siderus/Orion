import byteSize from 'byte-size'
import ipfsAPI from 'ipfs-api'
import { getMultiAddrIPFSDaemon } from '../../app/daemon.js'

const ERROR_IPFS_UNAVAILABLE = "IPFS NOT AVAILABLE"

let IPFS_CLIENT = null

export function startIPFS(){
  return  new Promise( success => {
    if(IPFS_CLIENT != null) return success(IPFS_CLIENT)
    let ipfs_local_multiAddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    IPFS_CLIENT = ipfsAPI(ipfs_local_multiAddr)
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
export function getStorageList(){
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
