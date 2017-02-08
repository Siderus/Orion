import { remote } from 'electron'
const { app, dialog, shell } = remote
import { addFileFromFSPath, unpinObject } from "../../app/api"

/**
 * This function will add the files from a list of their paths, and show
 * message when it was a success or a failure.
 *
 * ToDo: add loading messages/feedback
 */
export function addFilesPaths(paths){
  let buttons = ['Close', 'Open in the browser']
  let successMessageOption = {
    type: "info",
    title: "File/s added successfully",
    message: "All the files selected were added successfully! \n",
    cancelId: 0,
    buttons
  }

  let errorMessageOption = {
    type: "error",
    title: "Adding the file failed"
  }

  let promises = paths.map(path => addFileFromFSPath(path))
  return Promise.all(promises)
    .then( hashes  =>{
      // building the lines of the text messages, containing the file name
      // followed by its hash
      let text_lines = hashes.map(el => `${el[0].hash} ${el[0].path}`)

      // ToDo: improve this, maybe show a custom window with more details.
      //       it is ugly!!!
      successMessageOption.message +=`This includes: \n${text_lines.join(`\n`)}`
      let btn_id = dialog.showMessageBox(app.mainWindow, successMessageOption)

      // if(btn_id == buttons.indexOf('Open on the browser'))
      if(btn_id === 1)
        openInBrowser(hashes.map(el => el[0].hash))

    })
    .catch( (err) => {
      errorMessageOption.message = `Error: ${err}`
      dialog.showMessageBox(app.mainWindow, errorMessageOption)
    })
}

/**
 * This functuon will setup the document and body events to add a file on drag
 * and drop action.
 */
export function setupAddAppOnDrop(){
  document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
  }

  document.body.ondrop = (ev) => {
    ev.preventDefault()
    if(ev.dataTransfer){

      // ev.dataTransfer.files is not enumerable
      // let paths = ev.dataTransfer.files((file)=> file.path)
      let paths = []
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
export function proptAndRemoveObjects(hashes){
  let buttons = ["Abort", "Of course, Duh!"]
  let opts = {
    title: "Continue?",
    message: `Are you sure you want to delete ${hashes.length} files?`,
    detail: `This includes: \n${hashes.join(`\n`)}`,
    buttons,
    cancelId: 0,
  }

  let btnClicked = remote.dialog.showMessageBox(remote.app.mainWindow, opts)
  // Check the electron dialog documentation, cancel button is always 0
  if(btnClicked != 0){
    let promises = hashes.map(hash =>{
      return unpinObject(hash)
    })

    // ToDo: Handle failure
    return Promise.all(promises)
  }
  return Promise.resolve()
}


/**
 * Open hashes in a browser
 */
export function openInBrowser(hashes){
  hashes.forEach(hash => {
    shell.openExternal(`https://ipfs.io/ipfs/${hash}`)
  })
  return Promise.resolve(hashes)
}