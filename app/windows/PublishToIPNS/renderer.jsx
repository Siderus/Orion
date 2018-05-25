import React from 'react'
import ReactDom from 'react-dom'

import { remote } from 'electron'
import { initIPFSClient, publishToIPNS, getPeer } from '../../api'
import { trackEvent } from '../../stats'
import { multihash as isMultiHash } from 'is-ipfs'

// Load Components
import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button
} from 'react-photonkit'
import ProgressOverlay from '../../components/ProgressOverlay'
import CircularProgress from '../../components/CircularProgress'
import Input from '../../components/Input'

class PublishToIPNSWindow extends React.Component {
  state = {
    loading: false,
    hashValue: ''
  }

  componentDidMount () {
    trackEvent('PublishToIPNSWindowOpen')
    getPeer().then(peer => this.setState({ peer }))
  }

  handleCopyToClipboard = (event) => {
    event.preventDefault()
    const peerIdInput = document.getElementById('peer-id-input')
    peerIdInput.select()
    document.execCommand('copy')
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const hash = this.state.hashValue

    if (!isMultiHash(hash)) {
      remote.dialog.showErrorBox('Error', 'Please provide a valid hash.')
      return
    }

    this.setState({ loading: true })
    publishToIPNS(hash)
      .then(result => {
        this.setState({ loading: false })
        const message = `IPNS ${result.name} has been successfully updated to ${result.value}!`
        remote.dialog.showMessageBox({ type: 'info', message, cancelId: 0, buttons: ['Ok'] })
        window.close()
      })
      .catch(err => {
        this.setState({ loading: false })
        remote.dialog.showErrorBox('Error', err.message)
      })
  }

  handleHashChange = (event) => {
    this.setState({ hashValue: event.target.value })
  }

  render () {
    const { loading, peer, hashValue } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <Window>
          <Content>
            <Input
              id='peer-id-input'
              label="Your peer ID"
              type="text"
              value={peer ? peer.id : 'Loading...'}
              // using onChange instead of readOnly to allow the input to be selected
              onChange={() => { }}
              button={
                <Button
                  glyph='doc-text'
                  onClick={this.handleCopyToClipboard}
                />
              }
            />
            <Input
              value={hashValue}
              onChange={this.handleHashChange}
              label="Hash"
              type="text"
              placeholder="what would you like to publish?"
            />
            <p>Note: this process may take a few minutes!</p>
          </Content>
          <Toolbar ptType="footer">
            <Actionbar>
              <Button text="Publish" ptStyle="primary" type="submit" pullRight />
              <Button text="Close" ptStyle="default" onClick={window.close} />
            </Actionbar>
          </Toolbar>
          {
            loading &&
            <ProgressOverlay>
              <CircularProgress />
            </ProgressOverlay>
          }
        </Window>
      </form>
    )
  }
}

initIPFSClient()
// Render the ImportWindow
ReactDom.render(<PublishToIPNSWindow />, document.querySelector('#host'))
