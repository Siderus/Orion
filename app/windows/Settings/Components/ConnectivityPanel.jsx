import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'

import { Pane, Input, CheckBox } from 'react-photonkit'

const GatewayEnum = {
  SIDERUS: 'https://siderus.io',
  LOCAL: 'http://localhost:8080'
}

const isMac = process.platform === 'darwin'

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
    allowUserTracking: false
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
  }

  _handleSkipGatewayQueryChange = (event) => {
    const nextValue = !this.state.skipGatewayQuery
    /**
     * Save setting persistently
     */
    Settings.setSync('skipGatewayQuery', nextValue)
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
    Settings.setSync('gatewayURL', value)
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
    Settings.setSync('runInBackground', nextValue)
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
    Settings.setSync('disablePubSubIPNS', nextValue)
    /**
     * Update component's state
     */
    this.setState({
      disablePubSubIPNS: nextValue
    })
  }

  _handleUserTrackingChange = () => {
    const nextValue = !this.state.allowUserTracking
    Settings.setSync('allowUserTracking', nextValue)

    this.setState({ allowUserTracking: nextValue })
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
          label="Your peer ID"
          type="text"
          value={data.peer.id || '...'}
          placeholder="Hey girl..." readOnly
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
      </Pane>
    )
  }
}

export default ConnectivityPanel
