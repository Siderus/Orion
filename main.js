const { app } = require('electron')
const UploadWinow = require('./windows/Upload/window.js')
const SettingsWindow = require('./windows/Settings/window.js')

// Let's create the main window
app.mainWindow = null;
app.windws = [];

app.on('ready', function() {
    app.mainWindow = UploadWinow.create(app)
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (app.mainWindow === null) {
        app.mainWindow = UploadWinow.create(app)
    }
})