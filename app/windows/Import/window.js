/**
 * This window will simply prompt the user for the hash of an object/file and
 * show some informations about it.
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

module.exports.create = function createImportModal (app) {
  // Create the browser modal window.
  let thisWindow = new BrowserWindowClass({
    title: 'Import a new Object/File',
    parent: app.mainWindow,
    modal: true,

    width: 430,
    height: 250,
    minWidth: 300,
    minHeight: 250,

    maximizable: false,
    resizable: true,
    fullscreenable: false,

    show: false
  })

  // Show the window only when ready
  thisWindow.once('ready-to-show', () => {
    thisWindow.show()
  })

  // Load the index.html of the app.
  thisWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  thisWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    thisWindow = null
  })

  return thisWindow
}
