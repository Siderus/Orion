import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'
import { Pane, Input, Options } from 'react-photonkit'

const GatewayEnum = {
  SIDERUS: 'https://siderus.io',
  LOCAL: 'http://localhost:8080'
}

@observer
class GatewayPanel extends React.Component {
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

  render() {
    if (this.props.navigationStore.selected !== 3) return null
    return (
      <Pane className="settings">
        <label>IPFS Gateway</label>
        <select
          className="form-control"
          onChange={this._handleGatewayChange}
          value={this.state.gateway}
        >
          <option value={GatewayEnum.SIDERUS}>Siderus.io</option>
          <option value={GatewayEnum.LOCAL}>Local HTTP Gateway</option>
        </select>
      </Pane>
    )
  }
}

export default GatewayPanel