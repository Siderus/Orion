/**
 * Import/require this file to force the app to have one single instance
 */

import './lib/report/node'
import { app } from 'electron'

const shouldQuit = app.makeSingleInstance(() => {})

if (shouldQuit) {
  app.quit()
}
