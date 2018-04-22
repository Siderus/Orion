/**
 * This Window will list all the available object/hashs available in the IPFS
 * repository. Its purpose is to let the user know what he has added.
 */

import path from 'path'
import url from 'url'

import { BrowserWindow, remote } from 'electron'
import isRenderer from 'is-electron-renderer'

// Allow us to use create() in both electron windows and main process
let BrowserWindowClass
if (isRenderer) {
  BrowserWindowClass = remote.BrowserWindow
} else {
  BrowserWindowClass = BrowserWindow
}

module.exports = {}

module.exports.create = function createStorageWindow (app) {
  // Create the browser window.
  let theWindow = new BrowserWindowClass({
    width: 725,
    height: 450,
    minWidth: 400,
    minHeight: 300,
    // The transparency will make it feel more native
    titleBarStyle: 'hidden',
    fullscreenable: false,
    icon: path.join(__dirname, '../../../docs/logo.png'),

    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../../report.js')
    }
  })

  theWindow.once('ready-to-show', () => {
    theWindow.show()
  })

  // and load the index.html of the app.
  theWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  theWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    app.mainWindow = null
    theWindow = null
  })

  return theWindow
}
