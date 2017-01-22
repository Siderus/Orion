const {
  BrowserWindow
} = require('electron')

const path = require('path')
const url = require('url')

module.exports = {}

module.exports.create = function uploadWindowCreate() {
  // Create the browser window.
  let theWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: true,
    show: false
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
    theWindow = null
  })

  theWindow.once('ready-to-show', () => {
    theWindow.show()
  })

  return theWindow
}

module.exports.createModal = function settindsWindowModalCreate(parentWindow) {
  let theWindow = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    show: false
  })

  theWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  theWindow.once('ready-to-show', () => {
    theWindow.show()
  })
  return theWindow
}