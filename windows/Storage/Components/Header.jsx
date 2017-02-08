import { join } from "path"
import { remote } from "electron"

import {
  addFilesPaths, proptAndRemoveObjects
} from "../fileIntegration"

import { saveFileToPath } from "../../../app/api"

import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"


class Header extends React.Component {

  /**
   * Handle the add button click by adding a new file into the repository.
   */
  _handleAddButtonClick(){
    let selectOptions = {
      title: "Add File",
      properties: ["openFile", "openDirectory", "multiSelections"]
    }

    let paths = remote.dialog.showOpenDialog(remote.app.mainWindow, selectOptions)
    // ToDo: Handle failure
    addFilesPaths(paths)
  }

  /**
   * This will handle when the remove button is clicked. It uses the
   * StorageStore to check the selected element, prompts a "are you sure"
   * alert, and then deletes the elements eselected if everything is ok.
   */
  _handleRemoveButtonClick(){
    if(!this.props.storageStore) return
    if(this.props.storageStore.selected.length == 0) return

    let hashes = this.props.storageStore.selected.map( el => el.hash )

    proptAndRemoveObjects(hashes)
    .then(() => {
      this.props.storageStore.selected.clear()
      this.props.storageStore.elements.clear()
    })
  }

  /**
   * When clicked, save the selected elements/Objects in the FS. If the elements
   * selected are more than 1, it will ask the user the directory where those
   * should be saved.
   */
  _handleDownloadButtonClick(){
    // ToDo: extract file name when saving.
    if(!this.props.storageStore) return
    if(this.props.storageStore.selected.length == 0) return

    let selected = this.props.storageStore.selected
    let opts = { title: "Where should I save?" }

    // More than one object/element
    if(selected.length > 1){
      opts.properties = ["openDirectory", "createDirectory"]
      opts.buttonLabel = "Save everything here"
      let destDir = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)[0]

      let promises = selected.map(element =>{
        return saveFileToPath(element.hash, destDir)
      })
      // ToDo: Handle failure
      Promise.all(promises)

    }else{
      // selected.length == 1
      let opts = {properties: ['openDirectory'], buttonLabel: 'Save here'}
      let dest = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)
      saveFileToPath(selected[0].hash, dest[0])
    }
  }

  render() {
    return (
      <Toolbar title="Storage">
        <Actionbar>
          <ButtonGroup>
            <Button glyph="plus-circled" onClick={this._handleAddButtonClick.bind(this)}/>
            <Button glyph="minus-circled" onClick={this._handleRemoveButtonClick.bind(this)}/>
            <Button glyph="download" onClick={this._handleDownloadButtonClick.bind(this)}/>
          </ButtonGroup>

          <Button glyph="cog" pullRight/>
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Header