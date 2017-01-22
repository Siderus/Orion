/**
 * Import/require this file to force the app to have one single instance
 */

const {app} = require('electron')
const shouldQuit = app.makeSingleInstance(() => {})

if (shouldQuit) {
  app.quit()
}