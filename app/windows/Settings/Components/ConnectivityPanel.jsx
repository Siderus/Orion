import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'

import { Pane, Input, CheckBox } from 'react-photonkit'

const GatewayEnum = {
  SIDERUS: 'https://siderus.io',
  LOCAL: 'http://localhost:8080'
}

/**
 * Connectivity Panel
 */
@observer
class ConnectivityPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      gateway: GatewayEnum.SIDERUS,
      skipGatewayQuery: true
    }

    this._handleGatewayChange = this._handleGatewayChange.bind(this)
    this._handleSkipGatewayQueryChange = this._handleSkipGatewayQueryChange.bind(this)
  }

  componentWillMount() {
    /**
     * Retrieve settings from persistent storage
     */
    Promise.all([
      Settings.get('gatewayURL'),
      Settings.get('skipGatewayQuery')
    ])
      // .then(console.log)
      .then(values => this.setState({
        gateway: values[0],
        skipGatewayQuery: values[1] || false
      }))
  }

  _handleSkipGatewayQueryChange(event) {
    const value = !this.state.skipGatewayQuery
    /**
     * Save setting persistently
     */
    Settings.set('skipGatewayQuery', value)
    /**
     * Update component's state
     */
    this.setState({
      skipGatewayQuery: value
    })
  }

  _handleGatewayChange(event) {
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

  _handelOnSubit(event) {

  }

  render() {
    if (this.props.navigationStore.selected !== 1) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const data = this.props.informationStore
    // const peers = data.peers.map(peer => peer.addr.toString()).join("   ")
    return (
      <Pane className="settings">
        <form onSubmit={this._handelOnSubit.bind(this)}>

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

          {/*<TextArea
            label="Peers connected"
            value={peers}
            placeholder="Hey girl..." readOnly>
          </TextArea>*/}
        </form>
      </Pane>
    )
  }
}

export default ConnectivityPanel
