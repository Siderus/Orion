// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog, app } = require('electron').remote
let ipfsAPI = require('ipfs-api')

const { getMultiAddrIPFSDaemon } = require('../../app/daemon.js')


let ipfs_local_multiAddr, ipfs

function startEverything(){
  ipfs_local_multiAddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
  ipfs = ipfsAPI(ipfs_local_multiAddr)

  ipfs.repo.stat().then(console.log)
}

// Temporary solution, ToDo: configure to show this only when the IPFS daemon
// is ready. Check the lock?
setTimeout(startEverything, 5000)


