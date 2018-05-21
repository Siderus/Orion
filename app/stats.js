import Mixpanel from 'mixpanel'
import Settings from 'electron-settings'
import uuidv4 from 'uuid/v4'
import pjson from '../package.json'
import publicIp from 'public-ip'

const SettingsUserIDKey = 'statsUserID'

const client = Mixpanel.init(pjson.statsToken, {
  protocol: 'https'
})

let UserID = Settings.getSync(SettingsUserIDKey)

/*
 * setUpUser will configure the client in order to track errors, events and
 * follow users when debugging process.
 */
export function setUpUser () {
  return publicIp.v4().then(ipAddress => {
    if (!Settings.getSync(SettingsUserIDKey)) {
      UserID = uuidv4()
      Settings.setSync(SettingsUserIDKey, UserID)
    }

    UserID = Settings.getSync(SettingsUserIDKey)
    client.people.set(UserID, {
      version: `${pjson.version}`
    }, {
      $ip: ipAddress
    })
  })
}

/*
 * trackEvent will send a new event with specific data
 */
export function trackEvent (eventName, data) {
  return publicIp.v4().then(ipAddress => {
    if (!UserID) {
      setUpUser()
    }

    if (!data) {
      data = {}
    }

    data.distinct_id = UserID
    data.version = `${pjson.version}`
    data.$ip = ipAddress
    console.log("Event", eventName, data)
    client.track(eventName, data)
  })
}
