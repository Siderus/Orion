import { remote } from "electron"
import { addFilesPaths } from "../fileIntegration.js"
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

  render() {
    return (
      <Toolbar title="Storage">
        <Actionbar>
          <ButtonGroup>
            <Button glyph="plus-circled" onClick={this._handleAddButtonClick.bind(this)}/>
            <Button glyph="minus-circled" onClick={this._handleRemoveButtonClick.bind(this)}/>
            <Button glyph="download" />
          </ButtonGroup>

          <Button glyph="cog" pullRight/>
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Header