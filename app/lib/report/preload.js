const pjson = require('../../../package.json')
const { init } = require('@sentry/electron')

document.addEventListener('DOMContentLoaded', () => {
  init({
    dsn: 'https://4b375cfe65e64f2aafbc2f701d1398d0@sentry.io/1189440',
    release: `${pjson.version}/IPFS-${pjson.ipfsVersion}`,
    environment: `${pjson.env}`
  })
})
