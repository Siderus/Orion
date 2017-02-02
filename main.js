import { app }  from 'electron'

import { startIPFSCommand, setMultiAddrIPFSDaemon }  from './app/daemon.js'

import StorageWindow from './windows/Storage/window.js'

// Let's create the main window
app.mainWindow = null
// A little space for IPFS
let IPFS_PROCESS = null


// Setup the menu
require('./app/menu.js')
// Make sure we have a single instance
require('./app/singleInstance.js')



app.on('ready', () => {
  app.mainWindow = StorageWindow.create(app)
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
  }else{
    app.mainWindow = StorageWindow.create(app)
  }
})

app.on('will-quit', () => {
  // Kill IPFS process after the windows have been closed and before the app is
  // fully terminated
  if(IPFS_PROCESS){
    IPFS_PROCESS.kill()
  }
})


setMultiAddrIPFSDaemon()
IPFS_PROCESS = startIPFSCommand()
