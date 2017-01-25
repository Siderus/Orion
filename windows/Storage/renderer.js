// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog, app } = require('electron').remote
let ipfsAPI = require('ipfs-api')
let ipfs
const { getMultiAddrIPFSDaemon } = require('../../app/daemon.js')

function startIPFS(){
  return  new Promise((success)=>{
    console.log("Connecting to IPFS via API")
    let ipfs_local_multiAddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    ipfs = ipfsAPI(ipfs_local_multiAddr)
    return success(ipfs)
  })
}

function refreshStorage(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) return failure()
    ipfs.repo.stat().then(console.log)
    return success()
  })
}

function startEverything(){
  startIPFS().then(refreshStorage)
}

// // Temporary solution, ToDo: configure to show this only when the IPFS daemon
// // is ready. Check the lock?
// setTimeout(startEverything, 5000)


