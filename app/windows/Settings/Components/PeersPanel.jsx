import React from 'react'
import { remote } from 'electron'
import { observer } from 'mobx-react'
import { Pane, Button, CheckBox } from 'react-photonkit'
import Input from '../../../components/Input'
import { connectTo, addBootstrapAddr } from '../../../api'

@observer
class PeersPanel extends React.Component {
  initialState = {
    nodeToConnect: '',
    addToBootstrap: false
  }

  state = this.initialState

  _handleConnectToNode = () => {
    const { nodeToConnect, addToBootstrap } = this.state

    Promise.all([
      connectTo(nodeToConnect),
      addToBootstrap ? addBootstrapAddr(nodeToConnect) : false
    ])
      .then((res) => {
        remote.dialog.showMessageBox({
          type: 'info',
          message: 'Connected successfully!',
          buttons: ['Ok']
        })
        this.setState(this.initialState)
      })
      .catch(err => {
        console.error(err)
        remote.dialog.showMessageBox({
          type: 'error',
          message: `Something went wrong! \n${err}`,
          buttons: ['Ok']
        })
      })
  }

  render () {
    if (this.props.navigationStore.selected !== 2) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const { addresses } = this.props.informationStore.peer
    let nonLocalHostAdresses = addresses.filter(addr =>
      !addr.includes('::1') && !addr.includes('127.0.0.1')
    )

    // reverse the array to show the public ip first
    nonLocalHostAdresses = nonLocalHostAdresses.reverse()

    const { nodeToConnect, addToBootstrap } = this.state

    return (
      <Pane className="settings">
        <Input
          type='text'
          label={'Connect to a node:'}
          value={nodeToConnect}
          onChange={event => { this.setState({ nodeToConnect: event.target.value }) }}
          button={
            <Button
              text="Connect"
              glyph='paper-plane'
              onClick={this._handleConnectToNode}
            />
          }
        />
        <CheckBox
          label="Add to bootstrap nodes"
          checked={addToBootstrap}
          onChange={() => { this.setState({ addToBootstrap: !addToBootstrap }) }}
        />
        <br />
        <p>Your node addresses:</p>
        {
          nonLocalHostAdresses.map(address => (
            <Input
              key={address}
              type='text'
              value={address}
              // using onChange instead of readOnly to allow the input to be selected
              onChange={() => { }}
              button={
                <Button
                  glyph='doc-text'
                  onClick={() => { remote.clipboard.writeText(address) }}
                />
              }
            />
          ))
        }
      </Pane>
    )
  }
}

export default PeersPanel
