import { remote } from 'electron'

import React from 'react'
import { Icon } from 'react-photonkit'

import { saveFileToPath, publishToIPNS } from '../../../api'

import {
  proptAndRemoveObjects, openInBrowser
} from '../fileIntegration'

import DetailsWindow from '../../Details/window'

class StorageElement extends React.Component {
  constructor (props) {
    super(props)

    this.hideMenu = props.hideMenu ? props.hideMenu : false
    this.menu = null
    this.menuTemplate = [
      {
        label: 'Open in browser',
        click: (item) => {
          openInBrowser([this.props.element.hash])
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Copy Hash',
        click: (item) => {
          remote.clipboard.writeText(this.props.element.hash)
        }
      },
      {
        label: 'Save on disk',
        click: (item) => {
          const opts = { properties: ['openDirectory'], buttonLabel: 'Save here' }
          const dest = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)
          saveFileToPath(this.props.element.hash, dest[0])
        }
      },
      {
        label: 'Publish to IPNS',
        click: (item) => {
          publishToIPNS(this.props.element.hash)
            .then(result => {
              const message = `IPNS ${result.name} has been successfully updated to ${result.value}!`
              remote.dialog.showMessageBox({ type: 'info', message, cancelId: 0, buttons: ['Ok'] })
            })
            .catch(err => {
              remote.dialog.showErrorBox('Error', err.message)
            })
        }
      },
      {
        label: 'Remove',
        click: (item) => {
          proptAndRemoveObjects([this.props.element.hash])
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Properties',
        click: (item) => {
          DetailsWindow.create(remote.app, this.props.element.hash)
        }
      }
    ]
  }

  // Setup the Menu
  componentDidMount () {
    if (this.hideMenu === false) {
      this.menu = remote.Menu.buildFromTemplate(this.menuTemplate)
    }
  }

  _handleContextMenu (event) {
    event.preventDefault()
    this.menu.popup()
  }

  _handleCheckboxOnClick (element, proxy, event) {
    if (!this.props.storageStore) return

    if (this.props.storageStore.selected.find(el => el.hash === element.hash)) {
      this.props.storageStore.selected.pop(element)
    } else {
      this.props.storageStore.selected.push(element)
    }
  }

  render () {
    const el = this.props.element
    return (
      <tr key={el.hash} onContextMenu={this._handleContextMenu.bind(this)}>

        { this.props.storageStore
          ? <td>
            <input
              onClick={this._handleCheckboxOnClick.bind(this, el)}
              type='checkbox'
            />
          </td>
          : <td></td> }

        <td>
          {
            el.isDirectory &&
            <Icon glyph='folder' />
          }
          &nbsp;{el.hash}
        </td>
        <td>
          {el.stat.CumulativeSize.value} {el.stat.CumulativeSize.unit}
        </td>
        <td>
          {
            el.name || el.dag.links
              // filter out unnamed links (usually pieces of a file)
              .filter(link => !!link.name)
              .map(link => link.name)
              .join(', ')
          }
        </td>
      </tr>
    )
  }
}

export default StorageElement
