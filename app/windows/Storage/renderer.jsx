import React from "react"
import ReactDom from "react-dom"

// Load API and custom stuff
import { startIPFS, getPeersInfo, getRepoInfo } from "../../api"
import { getStorageList } from "../../api"
import { setupAddAppOnDrop } from "./fileIntegration"

// Load Components
import { Window, Content } from "react-photonkit"

// Load Custom Components
import Header from "./Components/Header"
import StorageList from "./Components/StorageList"
import Footer from "./Components/Footer"

// Load MobX Stores
import StorageStore from "./Stores/Storage"
import StatusStore from "./Stores/Status"

// This will store the loop's timeout ID
window.loopTimeoutID = null

// Setup drag and drop events for adding files
setupAddAppOnDrop()

/**
 * This method will poll periodically the API and update the store
 *
 * ToDo: Consider to use web workers to perform these actions
 */
function startLoop(){
  // Starts IPFS
  startIPFS().catch((err)=>{
    console.log(err)
    window.loopTimeoutID = setTimeout(startLoop, 0.25*1000)
  })
  let promises = []

  // Obtain the peers list and update teh Store
  promises.push(getPeersInfo()
    .then((peers)=>{
      StatusStore.peers = peers
  }))

  // Obtain the repo stats and update teh Store
  promises.push(getRepoInfo()
    .then((stats)=>{
      StatusStore.stats = stats
  }))

  // Obtain the repository pinned Objects (Pins or Storage)
  promises.push(getStorageList()
    .then((pins)=>{
      StorageStore.elements = pins
  }))

  // When everything is done, update in 1 sec
  // Having a timeout instead of a loop, will avoid to have the the same API
  // call, used more at the same time. This should be solved by implementing
  // native JS IPFS daemon.
  Promise.all(promises)
    .then(()=>{
      window.loopTimeoutID = setTimeout(startLoop, 1*1000)
    })
}

class App extends React.Component {
  render() {
    return (
      <Window>
        <Header storageStore={StorageStore}/>

        <Content>
          <StorageList storageStore={StorageStore}/>
        </Content>

        <Footer statusStore={StatusStore}/>
      </Window>
    )
  }
}


// Render the APP
ReactDom.render(<App />, document.querySelector("#host"))
startLoop()