import Settings from 'electron-settings'
import React from "react"
import { observer } from "mobx-react"

import { access, constants } from 'fs'

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

  // When the multiAddr of the IPFS API changes, update the settings
  _handleChangeMultiAddrIPFSDaemon(event){
    let addr = event.target.value
    if(addr.length > 5)
      Settings.set('daemon.multiAddrAPI', addr)
  }

  // When the user select target value
  _handleChangeStartDaemon(event){
    Settings.set('daemon.startIPFSAtStartup', event.target.checked)
  }

  _handleChangePathIPFSBinary(event){
    let ipfsPath = event.target.value

    access(ipfsPath, constants.R_OK | constants.X_OK, (err) => {
      if(!err)
        Settings.set('daemon.pathIPFSBinary', ipfsPath)
      else
        console.log(`${ipfsPath} does not exist or has wrong permissions`)
    });


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
            defaultValue={data.multiAddrAPI || getMultiAddrIPFSDaemon()}
            onChange={this._handleChangeMultiAddrIPFSDaemon}
            placeholder="Something lumpy like /ip4/127.0.0.1/tcp/5001"/>

          <Input
            label="Path of the IPFS binary"
            type="text"
            defaultValue={data.pathIPFSBinary || getPathIPFSBinary()}
            onChange={this._handleChangePathIPFSBinary}
            placeholder="/usr/local/bin/ipfs duh"/>

          <CheckBox
            label="Start IPFS Daemon with the app"
            checked={data.startIPFSAtStartup}
            onChange={this._handleChangeStartDaemon}
            />

          <label>Restart is required</label>

        </form>
      </Pane>
    )
  }
}

export default DaemonPanel
