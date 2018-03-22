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

class App extends React.Component {
  componentDidMount () {
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
        .then(pins => getStorageList(pins))
        .then((pins) => {
          StorageStore.elements = pins
        })
    ])
      .catch((err) => {
        alert(err)
      })
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
