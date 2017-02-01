import React from "react"
import ReactDom from "react-dom"

// Load Components
import { Window, Content, PaneGroup, Pane } from "react-photonkit"
import { Input, Button, ButtonGroup } from "react-photonkit"

// Load Custom Components
import Form from './Components/Form.jsx'
import Footer from './Components/Footer.jsx'

// Load MobX Stores
import Stats from "./Stores/Stats.js"

class App extends React.Component {
  render() {
    return (
      <Window>
        <Content>
          <Form statsStore={Stats}/>
        </Content>

        <Footer statsStore={Stats} />
      </Window>
    )
  }
}


// Render the APP
ReactDom.render(<App />, document.querySelector("#host"))