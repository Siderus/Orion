// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const byteSize = require('byte-size')
let ipfsAPI = require('ipfs-api')
const { getMultiAddrIPFSDaemon } = require('../../app/daemon.js')

let ipfs

export function startIPFS(){
  return  new Promise((success)=>{
    let ipfs_local_multiAddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    ipfs = ipfsAPI(ipfs_local_multiAddr)
    return success(ipfs)
  })
}

/**
 * Refresh the Repository Statistics and provides the sizes
 */
export function refreshRepoInfo(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) startIPFS()

    return ipfs.repo.stat({human: true})
      .then((stats)=> {
        stats.RepoSize = byteSize(stats.RepoSize)
        return success(stats)
      }, failure)
  })
}

/**
 * This will refresh the UI about the connections stats (peers)
 */
export function refreshPeersInfo(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) startIPFS()

    return ipfs.swarm.peers()
      .then((peers)=> {
        return success(peers)
      }, failure)
  })
}

/**
 * This will refresh the UI with the list of Pinned Objects
 */
export function refreshStorageList(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) startIPFS()

    return ipfs.pin.ls()
      .then((pinsObj)=>{
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
 * This simple function will wait for IPFS connection to be available via IPFS.
 * It relies on the ipfs variable with an undefined value.
 */
export function waitForIPFS(max_waiting=500){
  return new Promise((success, failure)=>{
    let interval
    let times = 0
    interval = setInterval(() =>{
      if(ipfs != undefined){
        clearInterval(interval)
        return success()
      }
      if(times >= max_waiting) {
        clearInterval(interval)
        return failure()
      }
      times++
    }, 0.25*1000)

  })
}

export function refresh(){
  return waitForIPFS()
    .then(refreshStorageList)
    .then(refreshRepoInfo)
    .then(refreshPeersInfo)
    .then(refreshStorageList)
}

export function start(){
  return startIPFS()
    .then(refresh)
}
