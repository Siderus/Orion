const path = require('path')
require('./report.js')

// First parameter is the app folder (containing package.json)
// Second parameter is the entry point of the app, i.e. app/index.js
require('electron-compile').init(path.join(__dirname, '..'), path.join(__dirname, '/index'))
