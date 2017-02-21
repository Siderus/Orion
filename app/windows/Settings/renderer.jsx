import React from 'react'
import ReactDom from 'react-dom'

// Load Components
import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button,
  PaneGroup
} from 'react-photonkit'

import { startIPFS } from '../../api'

import Sidebar from './Components/Sidebar'
import RepositoryPanel from './Components/RepositoryPanel'
import ConnectivityPanel from './Components/ConnectivityPanel'
import DaemonPanel from './Components/DaemonPanel'

// Load MobX Stores
import NavigationStore from './Stores/Navigation'
import InformationStore from './Stores/Information'

class SettingsWindow extends React.Component {
  componentDidMount () {
    InformationStore.loadData()
  }

  render () {
    return (
      <Window>

        <Content>
          <PaneGroup>
            <Sidebar navigationStore={NavigationStore} />

            <RepositoryPanel
              informationStore={InformationStore}
              navigationStore={NavigationStore}
            />
            <ConnectivityPanel
              informationStore={InformationStore}
              navigationStore={NavigationStore}
            />
            <DaemonPanel
              informationStore={InformationStore}
              navigationStore={NavigationStore}
            />
          </PaneGroup>
        </Content>

        <Toolbar ptType='footer'>
          <Actionbar>
            <Button text='Close' ptStyle='default' onClick={window.close} />
          </Actionbar>
        </Toolbar>

      </Window>
    )
  }
}

startIPFS()
// Render the Settings
ReactDom.render(<SettingsWindow />, document.querySelector('#host'))
