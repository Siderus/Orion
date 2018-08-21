import * as WinShell from './win-shell'

/**
 * This adds the option "Add to IPFS via Orion" to the context menu of the OS, for files
 * and directories. Currently only on windows.
 */
export function enableContextMenu () {
  const isWindows = process.platform === 'win32'

  if (isWindows) {
    WinShell.contextMenus.register().then(() => {
      console.log('Successfully added Orion to the windows context menu!')
    })
  }
}
