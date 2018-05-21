import Mixpanel from 'mixpanel'
import Settings from 'electron-settings'
import uuidv4 from 'uuid/v4'
import pjson from '../package.json'
import publicIp from 'public-ip'
import {release, platform} from 'os'

const SettingsUserIDKey = 'statsUserID'

const client = Mixpanel.init(pjson.statsToken, {
  protocol: 'https'
})

let UserID = Settings.getSync(SettingsUserIDKey)

/*
 * setUpUser will configure the client in order to track errors, events and
 * follow users when debugging process.
 */
export function setUpUser (ipAddress) {
  if (!Settings.getSync(SettingsUserIDKey)) {
    UserID = uuidv4()
    Settings.setSync(SettingsUserIDKey, UserID)
  }

  UserID = Settings.getSync(SettingsUserIDKey)
  client.people.set(UserID, {
    $first_name: UserID,
    version: `${pjson.version}`,
    os_release: `${release()}`,
    os_platform: `${platform()}`
  }, {
    $ip: ipAddress
  })
}

/*
 * trackEvent will send a new event with specific data. It will get the user
 * IP address, add/updates the platform, version, release to the profile and
 * then track the event.
 *
 * It returns a Promise
 */
export function trackEvent (eventName, data) {
  return new Promise((resolve, reject) => {
    return publicIp.v4().then(ipAddress => {
      setUpUser(ipAddress)

      if (!data) {
        data = {}
      }

      data.distinct_id = UserID
      data.version = `${pjson.version}`
      client.track(eventName, data, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  })
}
