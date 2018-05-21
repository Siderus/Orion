import { app, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join as pathJoin } from 'path'
import pjson from '../package.json'
import Settings from 'electron-settings'
import './report'
import rootDir from 'app-root-dir'
import setupTrayIcon from './setup-tray-icon'

import {
  startIPFSDaemon,
  ensuresIPFSInitialised,
  ensureDaemonConfigured,
  getSiderusPeers,
  connectToCMD,
  addBootstrapAddr,
  promiseRepoUnlocked,
  getAPIVersion
} from './daemon'

import {
  promiseIPFSReady,
  initIPFSClient
} from './api'

import LoadingWindow from './windows/Loading/window'
import StorageWindow from './windows/Storage/window'
import WelcomeWindow from './windows/Welcome/window'

// Let's create the main window
app.mainWindow = null

// A little space for IPFS processes
global.IPFS_PROCESS = null

// Sets default values for IPFS configurations
global.IPFS_BINARY_PATH = `${rootDir.get()}/go-ipfs/ipfs`
global.IPFS_MULTIADDR_API = '/ip4/127.0.0.1/tcp/5001'
global.IPFS_MULTIADDR_GATEWAY = '/ip4/127.0.0.1/tcp/8080'
global.IPFS_MULTIADDR_SWARM = ['/ip4/0.0.0.0/tcp/4001', '/ip6/::/tcp/4001']

// Used to point to the right IPFS repo & conf
global.IPFS_REPO_PATH = pathJoin(app.getPath('userData'), 'ipfs-repo')

// Setup the menu
require('./menu')
// Make sure we have a single instance
require('./singleInstance')

/**
 * Returns `true` if the user wants to use the running node and
 * `false`, if the user wants to use own node
 *
 * @returns {boolean}
 */
function askWhichNodeToUse (apiVersion) {
  let alertMessage = 'An IPFS instance is already up!'
  alertMessage += '\n\nWould you like Orion to connect to the available node, instead of using its own?'

  if (apiVersion !== pjson.ipfsVersion) {
    alertMessage += `\n\nPlease note: Orion was design with IPFS ${pjson.ipfsVersion} in mind, `
    alertMessage += `while the available API is running ${apiVersion}.`
  }

  const btnId = dialog.showMessageBox({
    type: 'info',
    message: alertMessage,
    buttons: ['No', 'Yes'],
    cancelId: 0,
    defaultId: 1
  })

  return btnId === 1
}

/**
 * This method will:
 *  1. setup the tray icon (except on macOS)
 *  2. check for updates
 *  3. show loading window
 *  4. check if an API is already running
 *  5. start the daemon if not
 *  6. connect to the API
 *  7. connect to the Siderus peers (and add them as bootstrap nodes)
 *  8. show storage window
 */
function startOrion () {
  // On MacOS it's expected for the app not to close, and to re-open it from Launchpad
  if (process.platform !== 'darwin') {
    setupTrayIcon()
  }

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
      text: 'Getting started...',
      percentage: 0
    })
    // Set up crash reports.
    // Set up the needed stuff as the app launches.

    getAPIVersion()
      .then(apiVersion => {
        // An api is already available on port 5001
        if (apiVersion !== null) {
          console.log('Another service on localhost:5001 has been deteced')
          const useExistingNode = askWhichNodeToUse(apiVersion)

          if (useExistingNode) {
            console.log('Using existing IPFS node (localhost:5001)')
            global.IPFS_BINARY_PATH = 'ipfs'
            global.IPFS_REPO_PATH = ''
            return Promise.resolve(false) // it should not start the ipfs daemon
          } else {
            // Use our own daemon, but on different ports
            console.log('Using custom setup for Orion new IPFS node (localhost:5101)')
            global.IPFS_MULTIADDR_API = '/ip4/127.0.0.1/tcp/5101'
            global.IPFS_MULTIADDR_GATEWAY = '/ip4/127.0.0.1/tcp/8180'
            global.IPFS_MULTIADDR_SWARM = ['/ip4/0.0.0.0/tcp/4101', '/ip6/::/tcp/4101']
          }
        }
        return Promise.resolve(true) // it should start the ipfs daemon
      })
      .then((shouldStart) => {
        // Logs the path and configuration used
        console.log('IPFS_BINARY_PATH', global.IPFS_BINARY_PATH)
        console.log('IPFS_MULTIADDR_API', global.IPFS_MULTIADDR_API)
        console.log('IPFS_MULTIADDR_GATEWAY', global.IPFS_MULTIADDR_GATEWAY)
        console.log('IPFS_MULTIADDR_SWARM', global.IPFS_MULTIADDR_SWARM)
        console.log('IPFS_REPO_PATH', global.IPFS_REPO_PATH)
        return Promise.resolve(shouldStart)
      })
      // Configure & Start the daemon in case
      .then((shouldStart) => {
        if (!shouldStart) return Promise.resolve()
        // ToDo: Use a single promise chain, stay away from crazy indentation
        // levels!

        // To ensure the configuration is correct, try to initialize the repo
        return ensuresIPFSInitialised()
          .then(() => {
            // initPorcess is a childprocess
            console.log('Configuring IPFS daemon')
            loadingWindow.webContents.send('set-progress', {
              text: 'Configuring IPFS daemon...',
              percentage: 10
            })
          })
          // Then change the json of the configuration file
          .then(ensureDaemonConfigured)
          .then(() => {
            // Show a message that we are starting the IPFS daemon
            console.log('IPFS Daemon: Starting')
            loadingWindow.webContents.send('set-progress', {
              text: 'Starting the IPFS Daemon...',
              percentage: 20
            })
          })
          .then(startIPFSDaemon)
          .then((process) => {
            global.IPFS_PROCESS = process
            return Promise.resolve()
          })
      })
      .then(promiseRepoUnlocked) // ensures that the api are ready
      // Start the IPFS API Client
      .then(initIPFSClient)
      .then(client => {
        console.log('Connecting to the IPFS Daemon')
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
}

app.on('start-orion', () => {
  startOrion()
})

app.on('ready', () => {
  const userAgreement = Settings.getSync('userAgreement')

  if (userAgreement) {
    startOrion()
  } else {
    // If the user did not accept our ToS, show the welcome window
    const welcomeWindow = WelcomeWindow.create(app)
    welcomeWindow.on('closed', () => {
      // If the user did not accept ToS, but closed the welcome window, quit (don't run the the bg)
      const userAgreement = Settings.getSync('userAgreement')
      if (!userAgreement) {
        app.quit()
      }
    })
  }
})

app.on('activate', () => {
  // Re-create the window in the app when the
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

app.on('window-all-closed', () => {
  // On MacOS this is already the expected behavior, no need to alert the user/close the app
  if (process.platform === 'darwin') return

  const systemTrayNotification = Settings.getSync('systemTrayNotification')

  if (systemTrayNotification === undefined) {
    const options = {
      type: 'info',
      title: 'The app will now run in the background',
      message: 'Quit or open the app from the system tray! \n\nYou can change this behavior in the settings window.',
      buttons: ['Got it!']
    }
    dialog.showMessageBox(options)
    Settings.set('systemTrayNotification', true)
  }

  const runInBackground = Settings.getSync('runInBackground')

  // if it's undefined or true don't quit
  if (runInBackground === false) {
    app.quit()
  }
})
