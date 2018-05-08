import path from 'path'
import { app, Menu, Tray } from 'electron'

let appIcon = null
const iconPath = path.join(__dirname, '../docs/logo.png')

function setupTrayIcon () {
  appIcon = new Tray(iconPath)
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
  appIcon.setContextMenu(contextMenu)
}

export default setupTrayIcon
