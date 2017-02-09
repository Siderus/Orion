import React from "react"
import ReactDom from "react-dom"

import { startIPFS } from '../../api'

// Load Components
import { Window, Content, PaneGroup, Pane } from "react-photonkit"
import { Input, Button, ButtonGroup } from "react-photonkit"

// Load Custom Components
import Form from './Components/Form'
import Stats from './Components/Stats'
import Footer from './Components/Footer'

// Load MobX Stores
import StatsStore from "./Stores/Stats"

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