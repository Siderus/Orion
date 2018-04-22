import { app, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import pjson from '../package.json'
import './report'

import {
  startIPFSDaemon,
  ensuresIPFSInitialised,
  ensureAddressesConfigured,
  getSiderusPeers,
  connectToCMD,
  addBootstrapAddr,
  promiseRepoUnlocked,
  checkApiConnection,
  setCustomBinaryPath,
  setCustomRepoPath
} from './daemon'

import {
  promiseIPFSReady,
  initIPFSClient
} from './api'

import LoadingWindow from './windows/Loading/window'
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
  // Ask github whether there is an update
  autoUpdater.checkForUpdates()
  autoUpdater.on('update-available', (info) => {
    const btnId = dialog.showMessageBox({
      type: 'info',
      message: 'A newer version is available!',
      buttons: ['Remind me next time', 'Open release page'],
      cancelId: 0,
      defaultId: 1
    })
    if (btnId === 1) {
      shell.openExternal(`${pjson.repository}/releases/latest`)
    }
  })

  const loadingWindow = LoadingWindow.create(app)
  loadingWindow.on('ready-to-show', () => {
    console.log('Loading window ready to show')
    loadingWindow.webContents.send('set-progress', {
      text: 'Starting IPFS daemon...',
      percentage: 0
    })
    // Set up crash reports.
    // Set up the needed stuff as the app launches.

    checkApiConnection()
      .then(connectionStatus => {
        // Api available
        if (connectionStatus) {
          const btnId = dialog.showMessageBox({
            type: 'info',
            message: `An IPFS instance is already up!
                      \nWould you like Orion to connect to the available node, instead of using its own?`,
            buttons: ['No', 'Yes'],
            cancelId: 0,
            defaultId: 1
          })
          if (btnId === 1) {
            // Use running node, skip starting the daemon
            setCustomRepoPath()
            setCustomBinaryPath()
            return Promise.resolve()
          }
        }

        return ensuresIPFSInitialised()
          .then(ensureAddressesConfigured)
          .then(startIPFSDaemon)
          .then((process) => {
            console.log('IPFS Daemon: Starting')
            global.IPFS_PROCESS = process
            loadingWindow.webContents.send('set-progress', {
              text: 'Initializing the IPFS Daemon...',
              percentage: 20
            })
            return Promise.resolve()
          })
          // Wait for the repo to be unlocked
          // (usually ipfs daemon needs some time before it releases the lock)
          .then(promiseRepoUnlocked)
      })
      // Start the IPFS API Client
      .then(initIPFSClient)
      .then(client => {
        console.log('Connecting to the IPFS Daemon')
        global.IPFS_CLIENT = client
        loadingWindow.webContents.send('set-progress', {
          text: 'Connecting to the IPFS Daemon...',
          percentage: 40
        })
        return Promise.resolve()
      })

      // Wait for the API to be alive
      .then(promiseIPFSReady)

      .then(() => {
        loadingWindow.webContents.send('set-progress', {
          text: 'Fetching a list of Siderus nodes...',
          percentage: 60
        })
        return Promise.resolve()
      })
      // Connect to Siderus
      .then(() => {
        return getSiderusPeers()
          .catch(err => {
            console.error('Error while fetching the Siderus Peers: ', err)
            return Promise.resolve([])
          })
      })
      .then(peers => {
        console.log('Connecting to Siderus Network')
        loadingWindow.webContents.send('set-progress', {
          text: 'Connecting to Siderus Network...',
          percentage: 80
        })
        // Using the CMD to connect, as the API seems not to work
        let connectPromises = peers.map(addr => { return connectToCMD(addr) })
        let bootstrapPromises = peers.map(addr => { return addBootstrapAddr(addr) })
        return Promise.all(connectPromises.concat(bootstrapPromises))
          .catch(err => {
            console.error('Error while connecting to Siderus Network: ', err)
            return Promise.resolve()
          })
      })
      // Log that we are ready
      .then(() => {
        console.log('READY')
        loadingWindow.webContents.send('set-progress', {
          text: 'Ready!',
          percentage: 100
        })
        app.mainWindow = StorageWindow.create(app)
        app.mainWindow.on('ready-to-show', () => {
          loadingWindow.close()
        })
      })
      // Catch errors
      .catch(err => {
        let message
        if (typeof err === 'string') {
          message = err
        } else if (err.message) {
          message = err.message
        } else {
          message = JSON.stringify(err)
        }
        dialog.showMessageBox({ type: 'warning', message })
        app.quit()
      })
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
