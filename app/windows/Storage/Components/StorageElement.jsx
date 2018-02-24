import { remote } from 'electron'

import React from 'react'
import { isEqual } from 'underscore'
import { Icon } from 'react-photonkit'

import { saveFileToPath } from '../../../api'

import {
  proptAndRemoveObjects, openInBrowser
} from '../fileIntegration'

import DetailsWindow from '../../Details/window'

class StorageElement extends React.Component {
  constructor(props) {
    super(props)

    this.menu = null
    this.menuTemplate = [
      {
        label: 'Open',
        click: (item) => {
          DetailsWindow.create(remote.app, this.props.element.hash)
        }
      },
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
        label: 'Remove',
        click: (item) => {
          proptAndRemoveObjects([this.props.element.hash])
        }
      },
    ]
  }

  // Setup the Menu
  componentWillMount() {
    this.menu = remote.Menu.buildFromTemplate(this.menuTemplate)
  }

  _handleContextMenu(event) {
    event.preventDefault()
    this.menu.popup()
  }

  _handleCheckboxOnClick(element, proxy, event) {
    if (this.props.storageStore.selected.find((el) => isEqual(el, element))) {
      this.props.storageStore.selected.pop(element)
    } else {
      this.props.storageStore.selected.push(element)
    }
  }

  render() {
    if (!this.props.storageStore) return <tr />
    const el = this.props.element
    return (
      <tr key={el.hash} onContextMenu={this._handleContextMenu.bind(this)}>
        <td>
          <input
            onClick={this._handleCheckboxOnClick.bind(this, el)}
            type='checkbox'
          />
        </td>
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
            el.dag.links
              // filter out unnamed links (usually pieces of a file)
              .filter(link => !!link.name)
              .map(link => link.name)
              .join(',')
          }
        </td>
      </tr>
    )
  }
}

export default StorageElement
