import { join as pathJoin } from 'path'
import './lib/report/node.js'

import { checkForAddRequests } from './lib/add-requests'
// we support adding files if you start the app with the `--add` param
checkForAddRequests()
// First parameter is the app folder (containing package.json)
// Second parameter is the entry point of the app, i.e. app/index.js
require('electron-compile').init(pathJoin(__dirname, '..'), pathJoin(__dirname, '/index'))
