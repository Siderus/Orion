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

import DetailsWindow from '../Details/window'

class ImportWindow extends React.Component {
  constructor() {
    super()
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(event) {
    event.preventDefault()
    const name = event.target[0].value
    resolveName(name)
      .then(result => {
        // result looks like /ipfs/QmYNQJoKGNHTpPxCBPh9KkDpaExgd2duMa3aF6ytMpHdao
        const hash = result.substring(6)

        if (isMultiHash(hash)) {
          const details = DetailsWindow.create(remote.app, hash)
          details.once('ready-to-show', () => {
            window.close()
          })
        } else {
          remote.dialog.showErrorBox('Error', 'Could not resolve name.')
        }
      })
      .catch(err => {
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
        </Window>
      </form>
    )
  }
}

startIPFS()
// Render the ImportWindow
ReactDom.render(<ImportWindow />, document.querySelector('#host'))
