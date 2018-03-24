import React from 'react'
import ReactDom from 'react-dom'
// Load Components
import { Window, Content } from 'react-photonkit'

// Load API and custom stuff
import {
  initIPFSClient,
  getPeersInfo,
  getRepoInfo,
  getStorageList,
  getObjectList
} from '../../api'
import { setupAddAppOnDrop } from './fileIntegration'

// Load Custom Components
import Header from './Components/Header'
import StorageList from './Components/StorageList'
import Footer from './Components/Footer'

// Load MobX Stores
import StorageStore from './Stores/Storage'
import StatusStore from './Stores/Status'

// Setup drag and drop events for adding files
setupAddAppOnDrop()
initIPFSClient()

// This will store the loop's timeout ID
window.loopTimeoutID = null

function startLoop () {
  // Runs multiple promises for gathering the content
  Promise.all([
    // get peers info
    getPeersInfo()
      .then((peers) => {
        StatusStore.peers = peers
      }),
    // Get the repository (pins)
    getRepoInfo()
      .then((stats) => {
        StatusStore.stats = stats
      }),
    // Get the objects lists and sorted
    getObjectList()
      .then(getStorageList)
      .then((pins) => {
        StorageStore.elements = pins
      })
  ])
    .then(() => {
      window.loopTimeoutID = setTimeout(startLoop, 1 * 1000)
    })
    .catch((err) => {
      alert(err)
    })
}

class App extends React.Component {
  componentDidMount () {
    startLoop()
  }

  componentWillUnmount () {
    clearTimeout(window.loopTimeoutID)
  }

  render () {
    return (
      <Window>
        <Header storageStore={StorageStore} />

        <Content>
          <StorageList storageStore={StorageStore} />
        </Content>

        <Footer statusStore={StatusStore} />
      </Window>
    )
  }
}

// Render the APP
ReactDom.render(<App />, document.querySelector('#host'))
