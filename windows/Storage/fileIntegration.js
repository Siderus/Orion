import { remote } from 'electron'
import { addFileFromFSPath } from "../../app/api.js"

import { get } from 'http'
import { createWriteStream, unlink } from 'fs'

/**
 * This function will add the files from a list of their paths, and show
 * message when it was a success or a failure.
 *
 * ToDo: add loading messages/feedback
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
    .then( hashes  =>{
      // building the lines of the text messages, containing the file name
      // followed by its hash
      let text_lines = hashes.map(el => `${el[0].hash} ${el[0].path}`)

      // ToDo: improve this, maybe show a custom window with more details.
      //       it is ugly!!!
      successMessageOption.message +=`This includes: \n${text_lines.join(`\n`)}`
      remote.dialog.showMessageBox(remote.app.mainWindow, successMessageOption)
    })
    .catch( (err) => {
      errorMessageOption.message = `Error: ${err}`
      remote.dialog.showMessageBox(remote.app.mainWindow, errorMessageOption)
    })
}

/**
 * This method will easily download from localhsot an Object, and save the file
 * into a specific path (dest).
 *
 * ToDo: Work with directories. (This saves only a file, not a directory)
 */
export function saveFileToPath(objectID, dest){
  return new Promise((success, failure) =>{
    let url = `http://localhost:8080/ipfs/${objectID}`
    let file = createWriteStream(dest)

    get(url, function(response) {
      response.pipe(file)

      file.on('finish', function() {
        file.close(success)
      })

    }).on('error', err => {
      // Delete the file.
      unlink(dest)
      failure(err.message)
    })

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