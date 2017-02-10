import React from "react"
import { observer } from "mobx-react"

import { Pane, NavGroup, NavTitle, NavGroupItem } from "react-photonkit"


@observer
class Sidebar extends React.Component {
  _handleClick(event){
    console.log(event.target.value)
  }

  render() {
    let selected = this.props.navigationStore.selected
    return (
      <Pane sidebar>
        <NavGroup>
          <NavTitle>Settings and Info</NavTitle>
          <NavGroupItem glyph="database" text="Repository"
            onClick={this._handleClick.bind(this)} active={selected === "Repository"}/>
          <NavGroupItem glyph="rss" text="Connectivity"
            onClick={this._handleClick.bind(this)} active={selected === "Connectivity"}/>
          <NavGroupItem glyph="rocket" text="Daemon"
            onClick={this._handleClick.bind(this)} active={selected === "Daemon"}/>
        </NavGroup>
      </Pane>
    )
  }
}

export default Sidebar
