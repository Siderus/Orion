import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'
import { trackEvent } from '../../../stats'

import { Pane, Button, CheckBox } from 'react-photonkit'
import Input from '../../../components/Input'
import * as WinShell from '../../../lib/os-context-menu/win-shell'

const GatewayEnum = {
  SIDERUS: 'https://siderus.io',
  LOCAL: 'http://localhost:8080'
}

const isMac = process.platform === 'darwin'
const isWindows = process.platform === 'win32'

/**
 * Connectivity Panel
 */
@observer
class ConnectivityPanel extends React.Component {
  state = {
    gateway: GatewayEnum.SIDERUS,
    skipGatewayQuery: true,
    runInBackground: true,
    disablePubSubIPNS: false,
    allowUserTracking: false,
    contextMenu: false
  }

  componentDidMount () {
    /**
     * Retrieve settings from persistent storage
     */
    Promise.all([
      Settings.get('gatewayURL'),
      Settings.get('skipGatewayQuery'),
      Settings.get('runInBackground'),
      Settings.get('disablePubSubIPNS'),
      Settings.get('allowUserTracking')
    ])
      // .then(console.log)
      .then(values => this.setState({
        gateway: values[0],
        skipGatewayQuery: values[1] || false,
        // the default (undefined) is considered true
        runInBackground: typeof values[2] !== 'boolean' ? true : values[2],
        disablePubSubIPNS: values[3] || false,
        allowUserTracking: values[4] || false
      }))
    /**
     * Retrieve settings from Windows Registry
     */
    if (isWindows) {
      WinShell.contextMenus.isRegistered().then(status => {
        this.setState({ contextMenu: status })
      })
    }
  }

  _handleSkipGatewayQueryChange = (event) => {
    const nextValue = !this.state.skipGatewayQuery
    /**
     * Save setting persistently
     */
    Settings.set('skipGatewayQuery', nextValue)
    /**
     * Update component's state
     */
    this.setState({
      skipGatewayQuery: nextValue
    })
  }

  _handleGatewayChange = (event) => {
    const { value } = event.target
    /**
     * Save setting persistently
     */
    Settings.set('gatewayURL', value)
    /**
     * Update component's state
     */
    this.setState({
      gateway: value
    })
  }

  _handleRunInBackgroundChange = (event) => {
    const nextValue = !this.state.runInBackground
    /**
     * Save setting persistently
     */
    Settings.set('runInBackground', nextValue)
    /**
     * Update component's state
     */
    this.setState({
      runInBackground: nextValue
    })
  }

  _handlePubSubIPNSChange = (event) => {
    const nextValue = !this.state.disablePubSubIPNS
    /**
     * Save setting persistently
     */
    Settings.set('disablePubSubIPNS', nextValue)
    /**
     * Update component's state
     */
    this.setState({
      disablePubSubIPNS: nextValue
    })
  }

  _handleUserTrackingChange = () => {
    const nextValue = !this.state.allowUserTracking
    if (!nextValue) {
      // we should no longer track the user, track only this last event
      trackEvent('userTrackingDisabled')
    }

    Settings.set('allowUserTracking', nextValue)

    if (nextValue) {
      // now that tracking is enabled (in the settings), we can start tracking
      trackEvent('userTrackingEnabled')
    }

    this.setState({ allowUserTracking: nextValue })
  }

  _handleCopyToClipboard = (event) => {
    event.preventDefault()
    const peerIdInput = document.getElementById('peer-id-input')
    peerIdInput.select()
    document.execCommand('copy')
  }

  /**
   * If the user wants to have "Add to IPFS via Orion" option in the context menu
   * we need to register this change in the windows registry. For removal we need to deregister.
   */
  _handleContextMenuChange = () => {
    if (isWindows) {
      if (this.state.contextMenu) {
        WinShell.contextMenus.deregister().then(() => {
          this.setState({ contextMenu: false })
        })
      } else {
        WinShell.contextMenus.register().then(() => {
          this.setState({ contextMenu: true })
        })
      }
    }
  }

  render () {
    if (this.props.navigationStore.selected !== 0) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const data = this.props.informationStore
    // const peers = data.peers.map(peer => peer.addr.toString()).join("   ")
    return (
      <Pane className="settings">
        <Input
          id='peer-id-input'
          label="Your peer ID"
          type="text"
          value={data.peer ? data.peer.id : 'Loading...'}
          // using onChange instead of readOnly to allow the input to be selected
          onChange={() => { }}
          button={
            <Button
              glyph='doc-text'
              onClick={this._handleCopyToClipboard}
            />
          }
        />

        <Input
          label="Number of peers connected"
          type="text"
          value={data.peers.length || 0}
          placeholder="Hey girl..." readOnly
        />

        <div className='form-group'>
          <label>IPFS Gateway</label>
          <select
            className="form-control"
            onChange={this._handleGatewayChange}
            value={this.state.gateway}
          >
            <option value={GatewayEnum.SIDERUS}>Siderus.io</option>
            <option value={GatewayEnum.LOCAL}>Local HTTP Gateway</option>
          </select>
        </div>

        <CheckBox
          label="Skip querying gateways after adding a file"
          checked={this.state.skipGatewayQuery}
          onChange={this._handleSkipGatewayQueryChange}
        />

        <CheckBox
          label="Disable IPNS over PubSub (experimental feature)"
          checked={this.state.disablePubSubIPNS}
          onChange={this._handlePubSubIPNSChange}
        />

        {
          !isMac &&
          <CheckBox
            label="Let the app run in background"
            checked={this.state.runInBackground}
            onChange={this._handleRunInBackgroundChange}
          />
        }

        <CheckBox
          label='Send anonymized statistics to help improve this app'
          checked={this.state.allowUserTracking}
          onChange={this._handleUserTrackingChange}
        />

        {
          isWindows &&
          <CheckBox
            label='Enable "Add to IPFS" option to files and folders'
            checked={this.state.contextMenu}
            onChange={this._handleContextMenuChange}
          />
        }
      </Pane>
    )
  }
}

export default ConnectivityPanel
