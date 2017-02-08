import { remote } from "electron"

import React from "react"
import { isEqual } from "underscore"

import { saveFileToPath } from "../../../app/api"

import {
  proptAndRemoveObjects, openInBrowser
} from "../fileIntegration"

class StorageElement extends React.Component {
  constructor(props){
    super(props)

    this.menu = null
    this.menuTemplate = [
      {
        label: 'Copy Hash',
        click: (item) => {
          remote.clipboard.writeText(this.props.element.hash)
        }
      },
      {
        label: 'Save on disk',
        click: (item) => {
          let opts = {properties: ['openDirectory'], title: 'where to save?'}
          let dest = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)
          saveFileToPath(this.props.element.hash, dest[0])
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
        label: 'Open on browser',
        click: (item) => {
          openInBrowser([this.props.element.hash])
        }
      },
    ]
  }

  // Setup the Menu
  componentWillMount(){
    this.menu = remote.Menu.buildFromTemplate(this.menuTemplate)
  }

  _handleContextMenu(event){
    event.preventDefault()
    this.menu.popup()
  }

  _handleCheckboxOnClick(element, proxy, event){
    if(this.props.storageStore.selected.find((el) => isEqual(el, element))){
      this.props.storageStore.selected.pop(element)
    }else{
      this.props.storageStore.selected.push(element)
    }
  }

  render() {
    if(!this.props.storageStore) return <tr></tr>
    let el = this.props.element
    return (
      <tr key={el.hash} onContextMenu={this._handleContextMenu.bind(this)}>
        <td>
          <input
            onClick={this._handleCheckboxOnClick.bind(this, el)}
            type="checkbox"/>
          &nbsp;{el.hash}
        </td>
        <td>
          {el.stat.CumulativeSize.value} {el.stat.CumulativeSize.unit}
        </td>
      </tr>
    )
  }
}

export default StorageElement