import { remote } from 'electron'
import { addFileFromFSPath } from '../api.js'

import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"


class Header extends React.Component {
  addFileButtonPressed(){
    let selectOptions = {
      title: "Add File",
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }

    let successMessageOption = {
      type: "info",
      title: "File/s added successfully",
      message: "All the files selected were added successfully"
    }

    let errorMessageOption = {
      type: "error",
      title: "Adding the file failed"
    }

    let paths = remote.dialog.showOpenDialog(remote.app.mainWindow, selectOptions)
    let promises = paths.map(path => addFileFromFSPath(path))
    Promise.all(promises)
      .then( ()=>{
        console.log("DONE")
        remote.dialog.showMessageBox(remote.app.mainWindow, successMessageOption)
      })
      .catch( (err) => {
        console.log("Oopsy")
        errorMessageOption.message = `Error: ${err}`
        remote.dialog.showMessageBox(remote.app.mainWindow, errorMessageOption)
      })
  }

  render() {
    return (
      <Toolbar title="Storage">
        <Actionbar>
          <ButtonGroup>
            <Button onClick={this.addFileButtonPressed.bind(this)} glyph="plus-circled" />
            <Button glyph="minus-circled" />
            <Button glyph="download" />
          </ButtonGroup>

          <Button glyph="cog" pullRight/>
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Header