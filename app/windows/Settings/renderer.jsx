import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../api'

// Load Components
import { Window, Content, Toolbar, Actionbar, Button } from "react-photonkit"
import { Pane, PaneGroup } from "react-photonkit"
import { NavGroup, NavGroupItem, NavTitle } from "react-photonkit"

import Sidebar from './Components/Sidebar'

// Load MobX Stores
import NavigationStore from "./Stores/Navigation"

class SettingsWindow extends React.Component {
  render() {
    return (
      <Window>

        <Content>
          <PaneGroup>
            <Sidebar navigationStore={NavigationStore} />
            <Pane></Pane>

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