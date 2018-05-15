import React from 'react'
import { observer } from 'mobx-react'

import { Pane, NavGroup, NavTitle, NavGroupItem } from 'react-photonkit'

const isMac = process.platform === 'darwin'

/**
 * Render the Sidebar, uses NavigatorStore
 */

@observer
class Sidebar extends React.Component {
  _handleSelect = (selected) => {
    this.props.navigationStore.selected = selected
  }

  render () {
    const navItems = [
      <NavTitle key='title'>Settings and Info</NavTitle>,
      <NavGroupItem key='con' glyph="rss" text="Connectivity" eventKey={0} />,
      <NavGroupItem key= 'rep' glyph="database" text="Repository" eventKey={1} />
    ]

    if (!isMac) {
      navItems.push(<NavGroupItem key='app' glyph="cog" text="App" eventKey={2} />)
    }

    return (
      <Pane sidebar ptSize="sm">
        <NavGroup onSelect={this._handleSelect}>
          {navItems}
        </NavGroup>
      </Pane>
    )
  }
}

export default Sidebar
