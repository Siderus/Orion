const { app } = require('electron')
const { existsSync, mkdirSync } = require('fs')
const path = require('path')
require('./lib/report/node.js')

/**
 * We need to ensure the userData directory is created before `electron-settings` attempts
 * to write the settings file.
 * The `electron-settings` module makes the assumption that the userData dir is created, but that
 * happens later in the app, not as early as our call to `electron-settings`.
 */
var userDataDirectory = app.getPath('userData')
if (!existsSync(userDataDirectory)) {
  mkdirSync(userDataDirectory)
}

// First parameter is the app folder (containing package.json)
// Second parameter is the entry point of the app, i.e. app/index.js
require('electron-compile').init(path.join(__dirname, '..'), path.join(__dirname, '/index'))
