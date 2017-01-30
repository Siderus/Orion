import { join } from "path"
import { remote } from "electron"

import { addFilesPaths, saveFileToPath } from "../fileIntegration.js"
import { unpinObject } from "../api.js"

import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"


class Header extends React.Component {
  _handleAddButtonClick(){
    let selectOptions = {
      title: "Add File",
      properties: ["openFile", "openDirectory", "multiSelections"]
    }

    let paths = remote.dialog.showOpenDialog(remote.app.mainWindow, selectOptions)
    addFilesPaths(paths)
  }

  /**
   * This will handle when the remove button is clicked. It uses the
   * StorageStore to check the selected element, prompts a "are you sure"
   * alert, and then deletes the elements eselected if everything is ok.
   */
  _handleRemoveButtonClick(){
    if(!this.props.storageStore) return;
    if(this.props.storageStore.selected.length == 0) return;
    let selected = this.props.storageStore.selected

    let buttons = ["Abort", "Of course, Duh!"]
    let opts = {
      title: "Continue?",
      message: `Are you sure you want to delete ${selected.length} files?`,
      detail: `This includes: \n${selected.map(el => el.hash).join(`\n`)}`,
      buttons,
      cancelId: 0,
    }

    let btnClicked = remote.dialog.showMessageBox(remote.app.mainWindow, opts)
    // Check the electron dialog documentation, cancel button is always 0
    if(btnClicked != 0){
      let promises = selected.map(element =>{
        return unpinObject(element.hash)
      })
      Promise.all(promises)
      .then(() => {
        this.props.storageStore.selected.clear()
        this.props.storageStore.elements.clear()
      })
    }
  }

  _handleDownloadButtonClick(){
    // ToDo: extract file name when saving.

    let selected = this.props.storageStore.selected
    let opts = { title: "Where should I save?" }

    if(selected.length > 1){
      opts.properties = ["openDirectory", "createDirectory"]
      opts.buttonLabel = "Save everything here"
      let destDir = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)[0]

      let promises = selected.map(element =>{
        let filePath = join(destDir, `./${element.hash}`)
        return saveFileToPath(element.hash, filePath)
      })
      Promise.all(promises)

    }else{ // selected.length == 1
      let dest = remote.dialog.showSaveDialog(remote.app.mainWindow)
      saveFileToPath(selected[0].hash, dest)
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