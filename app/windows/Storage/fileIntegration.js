import { remote } from 'electron'
import Settings from 'electron-settings'
import { addFilesFromFSPath, unpinObject } from '../../api'
import DetailsWindow from '../Details/window'

const { app, dialog, shell } = remote

/**
 * Returns `true` if the user wants to wrap all files under a single dir,
 * `false` otherwise
 *
 * @returns {boolean}
 */
function askWhetherToWrapAllFiles () {
  const buttons = ['No', 'Yes']
  const successMessageOption = {
    type: 'info',
    title: 'Before we do that...',
    message: 'Would you like to wrap all these files under the same directory?',
    cancelId: 0,
    defaultId: 1,
    buttons
  }

  const btnId = dialog.showMessageBox(app.mainWindow, successMessageOption)
  return btnId === 1
}

/**
 * This function will add the files from a list of their paths, and show
 * message when it was a success or a failure.
 *
 * ToDo: add loading messages/feedback
 */
export function addFilesPaths (paths) {
  // If no paths were selected it means the user canceled
  if (!paths) return

  let promises
  if (paths.length > 1 && askWhetherToWrapAllFiles()) {
    // If the user says yes to wrapping all files, simply pass the paths array
    promises = [addFilesFromFSPath(paths)]
  } else {
    // User wants to wrap each file (this method expects an array)
    promises = paths.map(path => addFilesFromFSPath([path]))
  }

  const buttons = ['Close', 'Open in the browser']
  const successMessageOption = {
    type: 'info',
    title: 'File/s added successfully',
    message: 'All the files selected were added successfully! \n',
    cancelId: 0,
    buttons
  }

  const errorMessageOption = {
    type: 'error',
    title: 'Adding the file failed'
  }

  return Promise.all(promises)
    .then(results => {
      // Array of wrappers expected
      // If the user upload only one file (or wrapped everything), open the Property Window (Details)
      if (results.length === 1) {
        const wrapper = results[0]
        return DetailsWindow.create(app, wrapper.hash)
      }

      // the old fashion way: show an alert with the `Open in browser` button
      // building the lines of the text messages, containing only the wrappers
      const textLines = results.map(wrapper => wrapper.hash)

      // ToDo: improve this, maybe show a custom window with more details.
      //       it is ugly!!!
      successMessageOption.message += `This includes the following hashes: \n${textLines.join('\n')}`
      const btnId = dialog.showMessageBox(app.mainWindow, successMessageOption)

      // if(btnId === buttons.indexOf('Open on the browser'))
      if (btnId === 1) {
        openInBrowser(results.map(wrapper => wrapper.hash))
      }
    })
    .catch((err) => {
      errorMessageOption.message = `Error: ${err}`
      dialog.showMessageBox(app.mainWindow, errorMessageOption)
    })
}

/**
 * This functuon will setup the document and body events to add a file on drag
 * and drop action.
 */
export function setupAddAppOnDrop () {
  document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
  }

  document.body.ondrop = (ev) => {
    ev.preventDefault()
    if (ev.dataTransfer) {
      // ev.dataTransfer.files is not enumerable
      // let paths = ev.dataTransfer.files((file)=> file.path)
      const paths = []
      for (let index = 0; index < ev.dataTransfer.files.length; index++) {
        paths.push(ev.dataTransfer.files[index].path)
      }

      addFilesPaths(paths)
    }
  }
}

/**
 * Prompt the user if he is sure that we should remove a file
 * return a Promise
 */
export function proptAndRemoveObjects (hashes) {
  const buttons = ['Abort', 'Of course, Duh!']
  const opts = {
    title: 'Continue?',
    message: `Are you sure you want to delete ${hashes.length} files?`,
    detail: `This includes: \n${hashes.join('\n')}`,
    buttons,
    cancelId: 0
  }

  const btnClicked = remote.dialog.showMessageBox(remote.app.mainWindow, opts)
  // Check the electron dialog documentation, cancel button is always 0
  if (btnClicked !== 0) {
    const promises = hashes.map(hash => unpinObject(hash))

    // ToDo: Handle failure
    return Promise.all(promises)
  }
  return Promise.resolve()
}

/**
 * Open hashes in a browser
 */
export function openInBrowser (hashes) {
  const gatewayURL = Settings.getSync('gatewayURL') || 'https://siderus.io'
  hashes.forEach(hash => {
    shell.openExternal(`${gatewayURL}/ipfs/${hash}`)
  })
  return Promise.resolve(hashes)
}
