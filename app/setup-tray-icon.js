import path from 'path'
import { app, Menu, Tray, nativeImage } from 'electron'

let appTray = null
const iconPath = path.join(__dirname, '../docs/logo.png')
const icon = nativeImage.createFromPath(iconPath)

/**
 * This will setup a tray icon for the app,
 * which allows the user to:
 *  - open the main window (StorageWindow)
 *  - quit the app.
 */
function setupTrayIcon () {
  appTray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Siderus Orion',
      click () {
        app.emit('activate')
      }
    },
    {
      label: 'Quit',
      click () {
        app.quit()
      }
    }
  ])

  // Call this again for Linux because we modified the context menu
  appTray.setContextMenu(contextMenu)
}

export default setupTrayIcon
