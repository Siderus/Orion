import React from 'react'
import { observer } from 'mobx-react'
import { Pane, CheckBox } from 'react-photonkit'
import * as ContextMenu from '../../../lib/os-context-menu/index'
import Settings from 'electron-settings'

const isWindows = process.platform === 'win32'

@observer
class IntegrationsPanel extends React.Component {
  state = {
    contextMenu: false
  }

  componentDidMount () {
    ContextMenu.isRegistered().then(status => {
      this.setState({ contextMenu: status })
    })
  }

  _handleContextMenuChange = () => {
    // We also need to change the settings otherwise Orion will re-enable the context menu on startup
    Settings.set('disableContextMenu', this.state.contextMenu)
    if (this.state.contextMenu) {
      ContextMenu.deregister().then(() => {
        this.setState({ contextMenu: false })
      })
    } else {
      ContextMenu.register().then(() => {
        this.setState({ contextMenu: true })
      })
    }
  }

  render () {
    if (this.props.navigationStore.selected !== 3) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null
    if (!isWindows) return null

    return (
      <Pane className="settings">
        <CheckBox
          label='Enable "Add to IPFS" option to files and folders'
          checked={this.state.contextMenu}
          onChange={this._handleContextMenuChange}
        />
      </Pane>
    )
  }
}

export default IntegrationsPanel
