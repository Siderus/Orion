import React from 'react'
import ReactDom from 'react-dom'

import { remote } from 'electron'
import { initIPFSClient, publishToIPNS, getPeer } from '../../api'
import { trackEvent } from '../../stats'

// Load Components
import {
  Window,
  Content,
  Input,
  Toolbar,
  Actionbar,
  Button
} from 'react-photonkit'
import ProgressOverlay from '../../components/ProgressOverlay'
import CircularProgress from '../../components/CircularProgress'

class PublishToIPNSWindow extends React.Component {
  state = {
    loading: false
  }

  componentDidMount () {
    trackEvent('PublishToIPNSWindowOpen')
    getPeer().then(peer => this.setState({ peer }))
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.setState({ loading: true })
    const hash = event.target[1].value
    publishToIPNS(hash)
      .then(result => {
        this.setState({ loading: false })
        const message = `Successfully published ${result.value} to IPNS!`
        remote.dialog.showMessageBox({ type: 'info', message })
        window.close()
      })
      .catch(err => {
        this.setState({ loading: false })
        remote.dialog.showErrorBox('Error', err.message)
      })
  }

  render () {
    const { loading, peer } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <Window>
          <Content>
            <Input
              label="Your peer ID"
              type="text"
              value={peer ? peer.id : 'Loading...'}
              readOnly
            />
            <Input
              label="Hash"
              type="text"
              placeholder="what would you like to publish?"
            />
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
