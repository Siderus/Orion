import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../api'

// Load Components
import { Window, Content, Toolbar, Actionbar, Button } from "react-photonkit"
import { Pane, PaneGroup } from "react-photonkit"

import Sidebar from './Components/Sidebar'
import RepositoryPanel from './Components/RepositoryPanel'
import ConnectivityPanel from './Components/ConnectivityPanel'
import DaemonPanel from './Components/DaemonPanel'

// Load MobX Stores
import NavigationStore from "./Stores/Navigation"

class SettingsWindow extends React.Component {
  render() {
    return (
      <Window>

        <Content>
          <PaneGroup>
            <Sidebar navigationStore={NavigationStore} />

            <RepositoryPanel navigationStore={NavigationStore}/>
            <ConnectivityPanel navigationStore={NavigationStore}/>
            <DaemonPanel navigationStore={NavigationStore}/>
          </PaneGroup>
        </Content>

        <Toolbar ptType="footer">
          <Actionbar>
            <Button text="Close" ptStyle="default" onClick={window.close} />
          </Actionbar>
        </Toolbar>

      </Window>
    )
  }
}

startIPFS()
// Render the Settings
ReactDom.render(<SettingsWindow />, document.querySelector("#host"))