import Settings from 'electron-settings'
import { shell, remote } from 'electron'

const SHARE_TEXT = 'Shared on IPFS with Siderus Orion. Read More: https://orion.siderus.io'

/**
 * Open hashes in a browser
 * @param {string[]} hashes
 */
export function openInBrowser (hashes) {
  hashes.forEach(hash => {
    shell.openExternal(getURLFromHash(hash))
  })
  return Promise.resolve(hashes)
}

/**
 * Constructs a shareable url with the gateway from settings or the default one
 *
 * @param {string} hash
 * @returns {string}
 */
export function getURLFromHash (hash) {
  const gatewayURL = Settings.get('gatewayURL') || 'https://siderus.io'
  return `${gatewayURL}/ipfs/${hash}`
}

export function shareViaFacebook (hash) {
  return shell.openExternal(`https://www.facebook.com/sharer.php?u=${getURLFromHash(hash)}`)
}

export function shareViaTwitter (hash) {
  return shell.openExternal(`https://twitter.com/intent/tweet?text=${getURLFromHash(hash)}`)
}

export function shareViaEmail (hash) {
  return shell.openExternal(`mailto:?body=${getURLFromHash(hash)}`)
}

export function shareViaTelegram (hash) {
  return shell.openExternal(`https://telegram.me/share/url?url=${getURLFromHash(hash)}&text=${SHARE_TEXT}`)
}

export const shareMenuTemplate = (hash) => ([{
  label: 'Copy URL',
  click: () => {
    remote.clipboard.writeText(getURLFromHash(hash))
  }
}, {
  label: 'via Email',
  click: () => {
    shareViaEmail(hash)
  }
}, {
  label: 'via Facebook',
  click: () => {
    shareViaFacebook(hash)
  }
}, {
  label: 'via Twitter',
  click: () => {
    shareViaTwitter(hash)
  }
}, {
  label: 'via Telegram',
  click: () => {
    shareViaTelegram(hash)
  }
}])
