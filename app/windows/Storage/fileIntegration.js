import { remote } from 'electron'
import Settings from 'electron-settings'
import { addFileFromFSPath, unpinObject } from '../../api'

const { app, dialog, shell } = remote

/**
 * This function will add the files from a list of their paths, and show
 * message when it was a success or a failure.
 *
 * ToDo: add loading messages/feedback
 */
export function addFilesPaths(paths) {
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

  const promises = paths.map(path => addFileFromFSPath(path))
  return Promise.all(promises)
    .then(results => {
      // building the lines of the text messages, containing the file name
      // followed by its hash
      const textLines = results.map(result => {
        // we need the hash of our wrapper
        const wrapper = result[result.length - 1]
        // we need the path of our upload (if it's a directory it will be second to last)
        const root = result[result.length - 2]

        return `${wrapper.hash} ${root.path}`
      })

      // ToDo: improve this, maybe show a custom window with more details.
      //       it is ugly!!!
      successMessageOption.message += `This includes: \n${textLines.join('\n')}`
      const btnId = dialog.showMessageBox(app.mainWindow, successMessageOption)

      // if(btnId === buttons.indexOf('Open on the browser'))
      if (btnId === 1) {
        openInBrowser(results.map(result => {
          const wrapper = result[result.length - 1]
          return wrapper.hash
        }))
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
export function setupAddAppOnDrop() {
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
export function proptAndRemoveObjects(hashes) {
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
export function openInBrowser(hashes) {
  const gatewayURL = Settings.getSync('gatewayURL') || 'https://siderus.io'
  hashes.forEach(hash => {
    shell.openExternal(`${gatewayURL}/ipfs/${hash}`)
  })
  return Promise.resolve(hashes)
}
