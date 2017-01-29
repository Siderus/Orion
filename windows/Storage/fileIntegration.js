import { remote } from 'electron'
import { addFileFromFSPath } from './api.js'

/**
 * This function will add the files from a list of their paths, and show
 * message when it was a success or a failure.
 *
 * ToDo: add loading messages
 */
export function addFilesPaths(paths){
  let successMessageOption = {
    type: "info",
    title: "File/s added successfully",
    message: "All the files selected were added successfully"
  }

  let errorMessageOption = {
    type: "error",
    title: "Adding the file failed"
  }

  let promises = paths.map(path => addFileFromFSPath(path))
  return Promise.all(promises)
    .then( ()=>{
      remote.dialog.showMessageBox(remote.app.mainWindow, successMessageOption)
    })
    .catch( (err) => {
      errorMessageOption.message = `Error: ${err}`
      remote.dialog.showMessageBox(remote.app.mainWindow, errorMessageOption)
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