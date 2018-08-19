import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'

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
