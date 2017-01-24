/**
 * This Window will list all the available object/hashs available in the IPFS
 * repository. Its purpose is to let the user know what he has added.
 */

const {
  BrowserWindow
} = require('electron')

const path = require('path')
const url = require('url')

module.exports = {}

module.exports.create = function createStorageWindow(app) {
  // Create the browser window.
  let theWindow = new BrowserWindow({
    width: 600,
    height: 400,
    minWidth: 400,
    minHeight: 300,
    titleBarStyle: 'hidden',
    fullscreenable: false,
    show: false
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
  theWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    app.mainWindow = null
    theWindow = null
  })

  return theWindow
}