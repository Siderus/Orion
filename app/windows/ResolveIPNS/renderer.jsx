import React from 'react'
import ReactDom from 'react-dom'

import { startIPFS, resolveName } from '../../api'
import { remote } from 'electron'
import { multihash as isMultiHash } from 'is-ipfs'

// Load Components
import {
  Window,
  Content,
  Input,
  Toolbar,
  Actionbar,
  Button,
  ButtonGroup
} from 'react-photonkit'
import ProgressOverlay from '../../components/ProgressOverlay'
import CircularProgress from '../../components/CircularProgress'
import DetailsWindow from '../Details/window'

class ResolveIPNSWindow extends React.Component {
  state = {
    loading: false
  }

  constructor() {
    super()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {
    event.preventDefault()
    this.setState({ loading: true })
    const name = event.target[0].value
    resolveName(name)
      .then(result => {
        // result looks like /ipfs/QmYNQJoKGNHTpPxCBPh9KkDpaExgd2duMa3aF6ytMpHdao
        const hash = result.substring(6)

        if (isMultiHash(hash)) {
          const details = DetailsWindow.create(remote.app, hash)
          details.once('ready-to-show', () => {
            this.setState({ loading: false })
            window.close()
          })
        } else {
          this.setState({ loading: false })
          remote.dialog.showErrorBox('Error', 'Could not resolve name.')
        }
      })
      .catch(err => {
        this.setState({ loading: false })
        remote.dialog.showErrorBox('Error', err.message)
      })
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Window>
          <Content>
            <Input
              label="IPNS"
              type="text"
              placeholder="the name to be resolved"
            />
          </Content>
          <Toolbar ptType="footer">
            <Actionbar>
              <Button text="Open" ptStyle="primary" type="submit" pullRight />
              <Button text="Close" ptStyle="default" onClick={window.close} />
            </Actionbar>
          </Toolbar>
          {
            this.state.loading &&
            <ProgressOverlay>
              <CircularProgress />
            </ProgressOverlay>
          }
        </Window>
      </form>
    )
  }
}

startIPFS()
// Render the ImportWindow
ReactDom.render(<ResolveIPNSWindow />, document.querySelector('#host'))
