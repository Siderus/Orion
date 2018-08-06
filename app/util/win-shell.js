/**
 * Read more here: https://discuss.atom.io/t/cross-platform-open-with-myapp-context-menu-entry-in-electron-apps/37407/7
 *
 * Copy pasted from https://github.com/atom/atom/blob/master/src/main-process/win-shell.js
 */

const Registry = require('winreg')

let appPath = `"${process.execPath}"`
let appName = 'Orion'

class ShellOption {
  constructor (key, parts) {
    this.key = key
    this.parts = parts
  }

  isRegistered = () => {
    return new Promise((resolve, reject) => {
      const reg = new Registry({ hive: 'HKCU', key: `${this.key}\\${this.parts[0].key}` })
      reg.get(this.parts[0].name, (err, val) => {
        resolve(err === null && val != null && val.value === this.parts[0].value)
      })
    })
  }

  register = () => {
    return new Promise((resolve) => {
      let doneCount = this.parts.length
      this.parts.forEach(part => {
        let reg = new Registry({ hive: 'HKCU', key: (part.key != null) ? `${this.key}\\${part.key}` : this.key })
        return reg.create(() => reg.set(part.name, Registry.REG_SZ, part.value, () => {
          if (--doneCount === 0) {
            return resolve()
          }
        }))
      })
    })
  }

  deregister = () => {
    return this.isRegistered().then(registerStatus => {
      if (registerStatus) {
        const reg = new Registry({ hive: 'HKCU', key: this.key })
        reg.destroy((err) => {
          if (err) return Promise.reject(err)

          return Promise.resolve(true)
        })
      } else {
        return Promise.resolve(false)
      }
    })
  }
}

let contextParts = [
  { key: 'command', name: '', value: `${appPath} --add "%1"` },
  { name: '', value: `Add to IPFS via ${appName}` },
  { name: 'Icon', value: `${appPath}` }
]

const fileContextMenu = new ShellOption(`\\Software\\Classes\\*\\shell\\${appName}`, contextParts)
const folderContextMenu = new ShellOption(`\\Software\\Classes\\Directory\\shell\\${appName}`, contextParts)
const folderBackgroundContextMenu = new ShellOption(`\\Software\\Classes\\Directory\\background\\shell\\${appName}`,
  JSON.parse(JSON.stringify(contextParts).replace('%1', '%V'))
)

exports.contextMenus = {
  isRegistered: () => {
    // only check one of them
    return fileContextMenu.isRegistered()
  },
  register: () => {
    return Promise.all([
      fileContextMenu.register(),
      folderContextMenu.register(),
      folderBackgroundContextMenu.register()
    ])
  },
  deregister: () => {
    return Promise.all([
      fileContextMenu.deregister(),
      folderContextMenu.deregister(),
      folderBackgroundContextMenu.deregister()
    ])
  }
}