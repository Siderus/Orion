import React from 'react'
import { remote } from 'electron'

import {
  addFilesPaths, proptAndRemoveObjects
} from '../fileIntegration'

import { saveFileToPath } from '../../../api'

import { Toolbar, Actionbar, ButtonGroup } from 'react-photonkit'
import Button from '../../../components/Button'

import SettingsWindow from '../../Settings/window'

class Header extends React.Component {
  state = {}
  /**
   * Handle the add button click by adding a new file into the repository.
   */
  _handleAddButtonClick () {
    const selectOptions = {
      title: 'Add File',
      properties: ['openFile', 'multiSelections']
    }

    if (process.platform === 'darwin') {
      selectOptions.properties.push('openDirectory')
    }

    const paths = remote.dialog.showOpenDialog(remote.app.mainWindow, selectOptions)
    // ToDo: Handle failure
    addFilesPaths(paths)
  }

  /**
   * This will handle when the remove button is clicked. It uses the
   * StorageStore to check the selected element, prompts a "are you sure"
   * alert, and then deletes the elements eselected if everything is ok.
   */
  _handleRemoveButtonClick () {
    if (!this.props.storageStore) return
    if (this.props.storageStore.selected.length === 0) return

    this.setState({ isRemoving: true })
    proptAndRemoveObjects(this.props.storageStore.selected)
      .then(() => {
        // we don't clear the items, only the selected ones
        // we wait for the storagelist to update itself to avoid a short empty table
        this.props.storageStore.selected.clear()
        this.setState({ isRemoving: false })
      })
      .catch(err => {
        remote.dialog.showErrorBox('Removing the file(s) has failed', err.message)
        this.setState({ isRemoving: false })
      })
  }

  /**
   * When clicked, save the selected elements/Objects in the FS. If the elements
   * selected are more than 1, it will ask the user the directory where those
   * should be saved.
   */
  _handleDownloadButtonClick () {
    // ToDo: extract file name when saving.
    if (!this.props.storageStore) return
    if (this.props.storageStore.selected.length === 0) return

    const selected = this.props.storageStore.selected
    const opts = {
      title: 'Where should I save?',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Save here'
    }
    const filePaths = remote.dialog.showOpenDialog(remote.app.mainWindow, opts)
    if (!filePaths) return

    const destination = filePaths[0]
    let sequentialChain = Promise.resolve()

    // we call saveFileToPath only after the previous call finished (in .then)
    selected.forEach(element => {
      sequentialChain = sequentialChain.then((res) => {
        return saveFileToPath(element.hash, destination)
      })
    })

    this.setState({ isSavingOnDisk: true })
    sequentialChain
      .then(result => this.setState({ isSavingOnDisk: false }))
      .catch(err => {
        remote.dialog.showErrorBox('Saving to disk has failed', err.message)
        this.setState({ isSavingOnDisk: false })
      })
  }

  /**
   * Opens SettingsWindow from the button
   */
  _handleSettingsButtonClick () {
    const settingsWindow = SettingsWindow.create(remote.app)
    settingsWindow.show()
  }

  /**
   * Opens SettingsWindow from the button
   */
  _handleActivitiesButtonClick () {
    remote.app.emit('show-activities-window')
  }

  render () {
    const { isSavingOnDisk, isRemoving } = this.state
    return (
      <Toolbar>
        <Actionbar>
          <ButtonGroup>
            <Button glyph='plus-circled' onClick={this._handleAddButtonClick.bind(this)} />
            <Button
              loading={isRemoving}
              glyph='minus-circled'
              onClick={this._handleRemoveButtonClick.bind(this)}
            />
            <Button
              loading={isSavingOnDisk}
              glyph='download'
              onClick={this._handleDownloadButtonClick.bind(this)}
            />
          </ButtonGroup>

          <Button glyph='cog' pullRight onClick={this._handleSettingsButtonClick.bind(this)} />
          <Button glyph='bell' pullRight onClick={this._handleActivitiesButtonClick.bind(this)} />
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Header
