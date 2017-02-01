/**
 * This window will simply prompt the user for the hash of an object/file and
 * show some informations about it.
 */

const {
  BrowserWindow
} = require('electron')

const path = require('path')
const url = require('url')

module.exports = {}

module.exports.create = function createImportModal(app) {
  // Create the browser modal window.
  let thisWindow = new BrowserWindow({
    title: "Import a new Object/File",
    parent: app.mainWindow,
    modal: true,

    width: 350,
    height: 300,
    minWidth: 300,
    minHeight: 400,

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
  thisWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    thisWindow = null
  })

  return thisWindow
}