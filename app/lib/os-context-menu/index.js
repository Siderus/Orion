import * as WinShell from './win-shell'

const isWindows = process.platform === 'win32'
/**
 * This adds the option "Add to IPFS via Orion" to the context menu of the OS, for files
 * and directories. Currently only on windows.
 */
export function ensureContextMenuEnabled () {
  if (isWindows) {
    WinShell.contextMenus.isRegistered().then(status => {
      // if it's not enabled, do it
      if (!status) {
        WinShell.contextMenus.register().then(() => {
          console.log('Successfully added Orion to the windows context menu!')
        })
      }
    })
  }
}

/**
 * Returns true if the context menu is registered, false otherwise
 *
 * @returns {Promise<boolean>}
 */
export function isRegistered () {
  if (isWindows) {
    return WinShell.contextMenus.isRegistered()
  }
}

/**
 * Registers the context menu
 *
 * @returns {Promise<boolean>}
 */
export function register () {
  if (isWindows) {
    return WinShell.contextMenus.register()
  }
}

/**
 * Deregisters the context menu
 *
 * @returns {Promise<boolean>}
 */
export function deregister () {
  if (isWindows) {
    return WinShell.contextMenus.deregister()
  }
}
