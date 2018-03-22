import React from 'react'
import { observer } from 'mobx-react'

import { Pane, NavGroup, NavTitle, NavGroupItem } from 'react-photonkit'

/**
 * Render the Sidebar, uses NavigatorStore
 */

@observer
class Sidebar extends React.Component {
  _handleSelect (selected) {
    this.props.navigationStore.selected = selected
  }

  render () {
    const selected = this.props.navigationStore.selected
    return (
      <Pane sidebar ptSize="sm">
        <NavGroup onSelect={this._handleSelect.bind(this)}>
          <NavTitle>Settings and Info</NavTitle>
          <NavGroupItem glyph="database" text="Repository" eventKey={0} />
          <NavGroupItem glyph="rss" text="Connectivity" eventKey={1} />
          <NavGroupItem glyph="rocket" text="Daemon" eventKey={2} />
        </NavGroup>
      </Pane>
    )
  }
}

export default Sidebar
