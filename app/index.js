import { app, dialog } from 'electron'

import {
  startIPFSDaemon,
  setMultiAddrIPFSDaemon,
  getSiderusPeers,
  connectToCMD
} from './daemon'

import {
  promiseIPFSReady,
  initIPFSClient,
} from './api'

import StorageWindow from './windows/Storage/window'

// Let's create the main window
app.mainWindow = null

// A little space for IPFS
global.IPFS_PROCESS = null
global.IPFS_CLIENT = null

// Setup the menu
require('./menu')
// Make sure we have a single instance
require('./singleInstance')

app.on('ready', () => {
  // Set up crash reports.
  // Set up the needed stuff as the app launches.

  startIPFSDaemon()
  .then((process) => {
    console.log("IPFS Daemon started")
    global.IPFS_PROCESS = process
    return Promise.resolve()
  })

  // Start the IPFS API Client
  .then(initIPFSClient)
  .then(client => {
    console.log("Connecting to the IPFS Daemon")
    global.IPFS_CLIENT = client
    return Promise.resolve()
  })

  // Wait for the API to be alive
  .then(promiseIPFSReady)

  // Connect to Siderus
  .then(getSiderusPeers)
  .then(peers => {
    console.log("Connecting to Siderus Network")
    // Using the CMD to connect, as the API seems not to work
    let proms = peers.map(addr => { return connectToCMD(addr) })
    return Promise.all(proms)
  })

  // Log that we are ready
  .then(() =>{
    console.log("READY")
    app.mainWindow = StorageWindow.create(app)
  })

  // Catch errors
  .catch(err =>{
    dialog.showMessageBox({type: "warning", message: err})
  })
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (app.mainWindow) {
    app.mainWindow.once('ready-to-show', () => {
      app.mainWindow.show()
    })
  } else {
    app.mainWindow = StorageWindow.create(app)
  }
})

app.on('will-quit', () => {
  // Kill IPFS process after the windows have been closed and before the app is
  // fully terminated
  if (global.IPFS_PROCESS) {
    global.IPFS_PROCESS.kill()
  }
})
