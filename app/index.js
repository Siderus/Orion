import { app, dialog, shell, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join as pathJoin } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import pjson from '../package.json'
import Settings from 'electron-settings'
import './lib/report/node'
import rootDir from 'app-root-dir'
import setupTrayIcon from './setup-tray-icon'
import { report } from './lib/report/util'
import { trackEvent } from './stats'
import { checkForAddRequests } from './lib/add-requests'

import {
  startIPFSDaemon,
  ensuresIPFSInitialised,
  ensureDaemonConfigured,
  ensureRepoMigrated,
  promiseRepoUnlocked
} from './daemon'

import {
  getSiderusPeers,
  getAPIVersion,
  promiseIPFSReady,
  initIPFSClient,
  importObjectByHash,
  connectTo,
  addBootstrapAddr
} from './api'

import LoadingWindow from './windows/Loading/window'
import StorageWindow from './windows/Storage/window'
import WelcomeWindow from './windows/Welcome/window'
import ActivitiesWindow from './windows/Activities/window'

import { ensureContextMenuEnabled } from './lib/os-context-menu'

// we support adding files if you start the app with the `--add` param
checkForAddRequests()

// Let's create the main window
app.mainWindow = null

// activities window
const activityLogPath = pathJoin(app.getPath('userData'), 'activity-log.json')
let activitiesWindow = null
export let activitiesById = []
export let activities = {}

// A little space for IPFS processes
global.IPFS_PROCESS = null

// Sets default values for IPFS configurations
global.IPFS_BINARY_PATH = `${rootDir.get()}/go-ipfs/ipfs`
global.REPO_MIGRATIONS_BINARY_PATH = `${rootDir.get()}/fs-repo-migrations/fs-repo-migrations`
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
    alertMessage += `\n\nPlease note: Orion was designed with IPFS ${pjson.ipfsVersion} in mind, `
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
 * startWelcome will open a new window and waint until the user closes it by
 * ending the Welcome Flow.
 * It checks if the user has already been through the Welcome page by validating
 * it as a version. This will help Orion to show the welcome page if there are
 * important changes to show.
 * It returns a promise.
 */
function startWelcome () {
  const welcomeVersion = Settings.get('welcomeVersion')
  // To do, change this to a variable?
  if (welcomeVersion <= 1) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    // If the user did not accept our ToS, show the welcome window
    const welcomeWindow = WelcomeWindow.create(app)
    app.mainWindow = welcomeWindow
    welcomeWindow.on('closed', () => {
      if (Settings.get('welcomeVersion') === 1) {
        return resolve()
      }
      app.quit()
    })
  })
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
  // ensure the "Add to IPFS via Orion" option is enabled
  if (!Settings.get('disableContextMenu')) {
    ensureContextMenuEnabled()
  }
  // retrieve the activity log from file
  if (existsSync(activityLogPath)) {
    const activityLog = JSON.parse(readFileSync(activityLogPath))
    activitiesById = activityLog.activitiesById
    // assign the activities as well, but first mark the ones that did not finish
    activitiesById.forEach(id => {
      const activity = activityLog.activities[id]
      activity.interrupted = !activity.finished
      activities[id] = activity
    })
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
      shell.openExternal(pjson.releasePage)
    }
  })
  autoUpdater.on('update-downloaded', (info) => {
    trackEvent('updateDownloaded', {
      from: pjson.version,
      to: info.version
    })
  })

  const loadingWindow = LoadingWindow.create(app)
  loadingWindow.on('ready-to-show', () => {
    app.mainWindow = loadingWindow
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
        console.log('REPO_MIGRATIONS_BINARY_PATH', global.REPO_MIGRATIONS_BINARY_PATH)
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
          .then(ensureRepoMigrated)
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
        let connectPromises = peers.map(addr => { return connectTo(addr) })
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
        app.emit('orion-started')
        // On MacOS it's expected for the app not to close, and to re-open it from Launchpad
        if (process.platform !== 'darwin') {
          setupTrayIcon()
        }
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
        report(message)
        dialog.showMessageBox({ type: 'warning', message })
        app.quit()
      })
  })
}

app.on('start-orion', () => {
  startWelcome().then(startOrion)
})

app.on('import-from-hash', (hash) => {
  app.emit('show-activities-window')

  importObjectByHash(hash)
    .then(() => { })
    .catch(err => {
      dialog.showErrorBox('Gurl, an error occurred!', `${err}`)
    })
})

/**
 * This will create a new Activities window or bring to focus the existing one.
 * We use this method instead of creating the window ourselves to ensure it's a singleton.
 */
app.on('show-activities-window', () => {
  if (!activitiesWindow) {
    activitiesWindow = ActivitiesWindow.create(app)
    activitiesWindow.on('closed', () => {
      activitiesWindow = null
    })
  } else {
    activitiesWindow.show()
  }
})

app.on('new-activity', (event) => {
  activitiesById.push(event.uuid)
  activities[event.uuid] = event

  updateActivitiesWindow()
})

app.on('patch-activity', (event) => {
  let activity = activities[event.uuid]
  const patched = Object.assign({}, activity, event)
  activities[event.uuid] = patched

  updateActivitiesWindow()
})

// after activities window is mounted, it will emit this event
ipcMain.on('update-activities', () => {
  updateActivitiesWindow()
})

/**
 * This function filters the given activities and activitiesById,
 * returning new objects with the unfinished activities only.
 *
 * @param {Array} activitiesById
 * @param {Object} activities
 */
export const filterUnfinishedActivities = (activitiesById, activities) => {
  let ongoingActivitiesById = []
  let ongoingActivities = {}

  ongoingActivitiesById = activitiesById.filter(id => {
    const activity = activities[uuid]
    return (!activity.finished && !activity.interrupted) || (!activity.finished)
  })

  ongoingActivities = ongoingActivitiesById.map(id => {
    return activities[id]
  })

  return {
    activitiesById: ongoingActivitiesById,
    activities: ongoingActivities
  }
}

ipcMain.on('clear-activities', () => {
  const ongoing = filterUnfinishedActivities(activitiesById, activities)

  activitiesById = ongoing.activitiesById
  activities = ongoing.activities

  updateActivitiesWindow()
})

function updateActivitiesWindow () {
  // update the activitiesWindow
  if (activitiesWindow) {
    activitiesWindow.webContents.send('update', { activities, activitiesById })
  }
}

app.on('ready', () => {
  startWelcome().then(startOrion)
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
  // persist activities
  writeFileSync(activityLogPath, JSON.stringify({ activitiesById, activities }))
})

app.on('window-all-closed', () => {
  // On MacOS this is already the expected behavior, no need to alert the user/close the app
  if (process.platform === 'darwin') return

  const systemTrayNotification = Settings.get('systemTrayNotification')

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

  const runInBackground = Settings.get('runInBackground')

  // if it's undefined or true don't quit
  if (runInBackground === false) {
    app.quit()
  }
})
