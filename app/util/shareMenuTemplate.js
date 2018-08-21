import { remote } from 'electron'
import {
  getURLFromHash,
  shareViaFacebook,
  shareViaTwitter,
  shareViaEmail
} from '../windows/Storage/fileIntegration'

const shareMenuTemplate = (hash) => ([{
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
}])

export default shareMenuTemplate
