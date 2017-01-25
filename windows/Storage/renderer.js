// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog, app } = require('electron').remote
const byteSize = require('byte-size')

let ipfsAPI = require('ipfs-api')

const { getMultiAddrIPFSDaemon } = require('../../app/daemon.js')

let ipfs

function startIPFS(){
  return  new Promise((success)=>{
    let ipfs_local_multiAddr = getMultiAddrIPFSDaemon() || "/ip4/127.0.0.1/tcp/5001"
    ipfs = ipfsAPI(ipfs_local_multiAddr)
    return success(ipfs)
  })
}

/**
 * This will refresh the UI with the Repo stats
 */
function refreshRepoInfo(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) return failure()


    return ipfs.repo.stat({human: true})
      .then((stats)=> {
        let text = document.getElementById("stats-repo")
        let repo_size = byteSize(stats.RepoSize)
        text.innerHTML = `Space: ${repo_size.value} ${repo_size.unit}`
        return success(stats)
      }, failure)
  })
}

/**
 * This will refresh the UI about the connections stats (peers)
 */
function refreshPeersInfo(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) return failure()

    return ipfs.swarm.peers()
      .then((peers)=> {
        // Update the dots icon
        let text = document.getElementById("stats-peers")
        text.innerHTML = `Peers: ${peers.length}`

        return success(peers)
      }, failure)
  })
}

/**
 * This will refresh the UI with the list of Pinned Objects
 */
function refreshStorageList(){
  return new Promise((success, failure)=>{
    if(ipfs === undefined) return failure()

    return ipfs.pin.ls()
      .then((pinsObj)=>{
        // Now we have pins, we have to filter out the ones that were added
        // outside the app (We don't have the filename for them).

        // From Object to Array
        let pins = []
        for(let key in pinsObj) {
          pins.push(pinsObj[key])
        }

        pins = pins.filter( (el) => el.Type !== "indirect")
        return success(pins)
      }, failure)
  })
}

/**
 * This simple function will wait for IPFS connection to be available via IPFS.
 * It relies on the ipfs variable with an undefined value.
 */
function waitForIPFS(max_waiting=500){
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

function refresh(){
  if(!app.mainWindow.isFocused()) return
  return waitForIPFS()
    .then(refreshStorageList)
    .then(refreshRepoInfo)
    .then(refreshPeersInfo)
    .then(refreshStorageList)
}

function start(){
  return startIPFS()
    .then(refresh)
}

/**
 * Here start the real app.
 */

// Setting up an interval that will wait for the Daemon to get up.
// It try check every 0.1 seconds.
let connectionCheckInterval
connectionCheckInterval = setInterval(()=>{
  start().then(()=>{
    // Success! The API started
    clearInterval(connectionCheckInterval)
  }, ()=>{
    console.log("Waiting for the daemon...")
  })
}, 0.1*1000)

// Set the refresh interval to 1 sec
setInterval(refresh, 1*1000)
