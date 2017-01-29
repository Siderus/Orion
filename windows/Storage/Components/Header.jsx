import { remote } from 'electron'
import { addFilesPaths } from '../fileIntegration.js'

import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"


class Header extends React.Component {
  addFileButtonPressed(){
    let selectOptions = {
      title: "Add File",
      properties: ['openFile', 'openDirectory', 'multiSelections']
    }

    let paths = remote.dialog.showOpenDialog(remote.app.mainWindow, selectOptions)
    addFilesPaths(paths)
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