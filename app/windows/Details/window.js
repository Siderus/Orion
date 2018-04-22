/**
 * This window shows detailed information about a hash  such as data size, cumulative size, etc,
 * but also information about its links under the tab files.
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

module.exports.create = function createDetailsWindow (app, hash) {
  // Create the browser modal window.
  let thisWindow = new BrowserWindowClass({
    title: 'Properties ' + hash,

    width: 650,
    height: 350,
    minWidth: 450,
    minHeight: 200,

    maximizable: false,
    resizable: true,
    fullscreenable: false,
    icon: path.join(__dirname, '../../../docs/logo.png'),

    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../../report.js')
    }
  })

  // Show menu only on StorageList
  thisWindow.setMenu(null)

  // Show the window only when ready
  thisWindow.once('ready-to-show', () => {
    thisWindow.show()
  })

  // Load the index.html of the app.
  thisWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    search: `hash=${hash}`
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
