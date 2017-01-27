import React from "react"
import ReactDom from "react-dom"

// Load API
import {startIPFS, getPeersInfo, getRepoInfo, getStorageList} from "./api.js"

// Load Components
import { Window, Content, PaneGroup, Pane } from "react-photonkit"
import { Toolbar, Actionbar, Button, ButtonGroup, Table } from "react-photonkit"

// Load Custom Components
import Header from "./Components/Header.jsx"
import StorageList from "./Components/StorageList.jsx"
import Footer from "./Components/Footer.jsx"

// Load MobX Stores
import StorageStore from "./Stores/Storage.js"
import StatusStore from "./Stores/Status.js"

window.store = StorageStore
/**
 * This method will poll periodically the API and update the store
 */
function updateUI(){
  // Starts IPFS
  startIPFS()
  // Obtain the peers list and update teh Store
  getPeersInfo()
    .then((peers)=>{
      StatusStore.peers = peers
    })
  // Obtain the repo stats and update teh Store
  getRepoInfo()
    .then((stats)=>{
      StatusStore.stats = stats
    })
  // Obtain the repository pinned Objects (Pins or Storage)
  getStorageList()
    .then((pins)=>{
      StorageStore.elements = pins
    })
}

class App extends React.Component {
  render() {
    return (
      <Window>
        <Header />

        <Content>
          <StorageList store={StorageStore}/>
        </Content>

        <Footer store={StatusStore}/>
      </Window>
    )
  }
}

// Update the Storage / UI
setInterval(updateUI, 1*1000)
// Render the APP
ReactDom.render(<App />, document.querySelector("#host"))
