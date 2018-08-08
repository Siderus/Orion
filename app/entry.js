import { join as pathJoin } from 'path'
import './lib/report/node.js'

import { checkForAddRequests } from './setup-add-requests'
checkForAddRequests()
// First parameter is the app folder (containing package.json)
// Second parameter is the entry point of the app, i.e. app/index.js
require('electron-compile').init(pathJoin(__dirname, '..'), pathJoin(__dirname, '/index'))
