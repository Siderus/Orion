import Settings from 'electron-settings'
import React from "react"
import { observer } from "mobx-react"

import { getMultiAddrIPFSDaemon, getPathIPFSBinary } from '../../../daemon'

import { Pane, Input, CheckBox } from "react-photonkit"

/**
 * Daemon Panel
 */

@observer
class DaemonPanel extends React.Component {
  constructor(props){
    super(props)

    this.settings = {}
  }

  componentDidMount() {
    Settings.get('daemon').then( val => this.settings = val )
  }

  _handelOnSubit(event){

  }

  render() {
    if(this.props.navigationStore.selected != 2) return null
    let data = this.settings || {}

    return (
      <Pane className="settings">
        <form onSubmit={this._handelOnSubit.bind(this)}>

          <Input
            label="API multiaddress to use:"
            type="text"
            value={data.pathIPFSBinary || getMultiAddrIPFSDaemon()}
            placeholder="Hey girl..."/>

          <Input
            label="Path of the IPFS binary"
            type="text"
            value={data.pathIPFSBinary || getPathIPFSBinary()}
            placeholder="/usr/local/bin/ipfs"/>

          <CheckBox label="Try to start IPFS Daemon when the app opens" />

          <label>Restart is required</label>

        </form>
      </Pane>
    )
  }
}

export default DaemonPanel
