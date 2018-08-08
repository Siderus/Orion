import { app } from 'electron'
import { join as pathJoin, resolve as pathResolve } from 'path'
import { existsSync, readFileSync, writeFileSync, watchFile } from 'fs'
import { addFilesFromFSPath } from './api'

const addRequestsFile = pathJoin(app.getPath('userData'), 'add-requests.json')

// we need to create the file before we can watch it
if (!existsSync(addRequestsFile)) {
  writeFileSync(addRequestsFile, '[]')
}

/**
 * If the app was started with --add filename,
 * make sure to pin to IPFS the given filename
 */
function handleAddRequests () {
  const filesToAdd = JSON.parse(readFileSync(addRequestsFile))
  console.log('Adding the following files:', filesToAdd)
  addFilesFromFSPath(filesToAdd)
  // reset the file
  writeFileSync(addRequestsFile, '[]')
}

app.on('orion-started', () => {
  console.log('Orion was started with the arguments:', process.argv)
  handleAddRequests()
  watchFile(addRequestsFile, handleAddRequests)
})

/**
 * if the app was started with the --add parameter (e.g. orion --add thisfile)
 * we need to write down the filenames
 */
export function checkForAddRequests () {
  // take all the args after "--add"
  const addIndex = process.argv.indexOf('--add')
  if (addIndex > -1) {
    const filesToAdd = process.argv.splice(addIndex + 1).map(file => pathResolve(file))
    // write to the files what we need to add
    writeFileSync(addRequestsFile, JSON.stringify(filesToAdd))
  }
}
