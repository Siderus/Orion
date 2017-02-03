import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../app/api'

// Load Components
import { Window, Content, PaneGroup, Pane } from "react-photonkit"
import { Input, Button, ButtonGroup } from "react-photonkit"

// Load Custom Components
import Form from './Components/Form.jsx'
import Stats from './Components/Stats.jsx'
import Footer from './Components/Footer.jsx'

// Load MobX Stores
import StatsStore from "./Stores/Stats.js"

class App extends React.Component {
  render() {
    return (
      <Window>
        <Content>
          <Form statsStore={StatsStore}/>
          <Stats statsStore={StatsStore} />
        </Content>

        <Footer statsStore={StatsStore} />
      </Window>
    )
  }
}


startIPFS()
// Render the APP
ReactDom.render(<App />, document.querySelector("#host"))