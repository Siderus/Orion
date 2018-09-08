import React from 'react'
import { observer } from 'mobx-react'
import { Pane, CheckBox } from 'react-photonkit'
import * as ContextMenu from '../../../lib/os-context-menu/index'
import Settings from 'electron-settings'
import styled from 'styled-components'

const isWindows = process.platform === 'win32'

const WrappingSetting = styled.div`
  .checkbox {
    margin-bottom: 0px;
  }

  p {
    margin-top: 0px;
    color: rgb(127,127,127);
    font-style: italic;
  }
`

@observer
class IntegrationsPanel extends React.Component {
  state = {
    contextMenu: false,
    disableWrapping: false
  }

  componentDidMount () {
    ContextMenu.isRegistered().then(status => {
      this.setState({ contextMenu: status })
    })

    const disableWrapping = Settings.get('disableWrapping')
    this.setState({ disableWrapping })
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

  _handleWrappingChange = () => {
    const nextValue = !this.state.disableWrapping
    Settings.set('disableWrapping', nextValue)
    this.setState({ disableWrapping: nextValue })
  }

  render () {
    if (this.props.navigationStore.selected !== 3) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    return (
      <Pane className="settings">
        {
          isWindows &&
          <CheckBox
            label='Enable "Add to IPFS" option to files and folders'
            checked={this.state.contextMenu}
            onChange={this._handleContextMenuChange}
          />
        }
        <WrappingSetting>
          <CheckBox
            label='Enable wrapping when adding a file'
            checked={!this.state.disableWrapping}
            onChange={this._handleWrappingChange}
          />
          <p>Wrapping a file will help preserving file names and extensions</p>
        </WrappingSetting>
      </Pane>
    )
  }
}

export default IntegrationsPanel
