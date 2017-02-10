import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../api'

// Load Components
import { Window, Content, Toolbar, Actionbar, Button } from "react-photonkit"
import { Pane, PaneGroup } from "react-photonkit"

import Sidebar from './Components/Sidebar'
import DynamicPanel from './Components/DynamicPanel'

// Load MobX Stores
import NavigationStore from "./Stores/Navigation"

class SettingsWindow extends React.Component {
  render() {
    return (
      <Window>

        <Content>
          <PaneGroup>
            <Sidebar navigationStore={NavigationStore} />
            <DynamicPanel navigationStore={NavigationStore} />
          </PaneGroup>
        </Content>

        {/* Footer */}
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