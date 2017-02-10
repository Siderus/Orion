import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../api'

// Load Components
import { Window, Content } from "react-photonkit"

// Load MobX Stores
import StatsStore from "./Stores/Stats"

class SettingsWindow extends React.Component {
  render() {
    return (
      <Window>
        <Content>
          <h1>WOW</h1>
        </Content>
      </Window>
    )
  }
}

startIPFS()
// Render the Settings
ReactDom.render(<SettingsWindow />, document.querySelector("#host"))