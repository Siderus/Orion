import { remote } from 'electron'

import React from 'react'
import { Icon } from 'react-photonkit'

import { saveFileToPath, publishToIPNS } from '../../../api'

import {
  proptAndRemoveObjects,
  openInBrowser
} from '../fileIntegration'
import shareMenuTemplate from '../../../util/shareMenuTemplate'

import DetailsWindow from '../../Details/window'
import formatElement from '../../../util/format-element'

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
        label: 'Share',
        submenu: shareMenuTemplate(this.props.element.hash)
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
          const response = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)
          if (response) {
            const destination = response[0]
            saveFileToPath(this.props.element.hash, destination)
          }
        }
      },
      {
        label: 'Publish to IPNS',
        click: (item) => {
          const el = this.props.element
          publishToIPNS(el.hash)
            .then(result => {
              const message = `IPNS ${name} has been successfully updated to:\n\n${formatElement(el)}!`
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
          proptAndRemoveObjects([this.props.element])
            .catch(err => {
              remote.dialog.showErrorBox('Removing the file(s) has failed', err.message)
            })
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
    this.menu.popup({})
  }

  _handleRowSelection = (event, element) => {
    if (!this.props.storageStore) return

    const { elements, selected } = this.props.storageStore
    const lastSelectedElement = selected[selected.length - 1]

    if (event.shiftKey && lastSelectedElement) {
      // multi select
      // find the position of the elemented selected last and current
      const firstIndex = elements.indexOf(element)
      // ugly hack because lastSelectedElement does not have the same ref (it's coming from `selected`)
      const lastIndex = elements.indexOf(elements.find(x => x.hash === lastSelectedElement.hash))

      // select every element between current and last
      if (firstIndex < lastIndex) {
        for (let i = firstIndex; i < lastIndex; i++) {
          this._selectElement(elements[i])
        }
      } else {
        for (let i = lastIndex + 1; i <= firstIndex; i++) {
          this._selectElement(elements[i])
        }
      }
    } else {
      // single select
      this._selectElement(element)
    }
  }

  _selectElement = (element) => {
    if (!this.props.storageStore) return

    const { selected } = this.props.storageStore

    if (selected.find(el => el.hash === element.hash)) {
      this.props.storageStore.selected = selected.filter(el => el.hash !== element.hash)
      this.forceUpdate()
    } else {
      selected.push(element)
      this.forceUpdate()
    }
  }

  render () {
    const el = this.props.element

    let selected = false
    if (this.props.storageStore) {
      selected = this.props.storageStore.selected.find(x => x.hash === el.hash) !== undefined
    }

    return (
      <tr
        className={selected ? 'active' : ''}
        onClick={(event) => { this._handleRowSelection(event, el) }}
        key={el.hash}
        onContextMenu={this._handleContextMenu.bind(this)}
      >

        {this.props.storageStore
          ? <td>
            <input
              checked={selected}
              type='checkbox'
            />
          </td>
          : <td></td>}

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
