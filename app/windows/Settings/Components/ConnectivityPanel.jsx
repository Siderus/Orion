import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'

import { Pane, Input } from 'react-photonkit'

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
      gateway: GatewayEnum.SIDERUS
    }

    this._handleGatewayChange = this._handleGatewayChange.bind(this)
  }

  componentWillMount() {
    /**
     * Retrieve setting from persistent storage
     */
    Settings.get('gatewayURL').then(value => this.setState({ gateway: value }))
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

          <label>IPFS Gateway</label>
          <select
            className="form-control"
            onChange={this._handleGatewayChange}
            value={this.state.gateway}
          >
            <option value={GatewayEnum.SIDERUS}>Siderus.io</option>
            <option value={GatewayEnum.LOCAL}>Local HTTP Gateway</option>
          </select>

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
