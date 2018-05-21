import Mixpanel from 'mixpanel'
import Settings from 'electron-settings'
import uuidv4 from 'uuid/v4'
import pjson from '../package.json'

const SettingsUserIDKey = 'statsUserID'

const client = Mixpanel.init('9d407c14d888a212cf04c397a95acb7b', {
  protocol: 'https'
})

let UserID = Settings.getSync(SettingsUserIDKey)

/*
 * setUpUser will configure the client in order to track errors, events and
 * follow users when debugging process.
 */
export function setUpUser () {
  if (!Settings.getSync(SettingsUserIDKey)) {
    UserID = uuidv4()
    Settings.setSync(SettingsUserIDKey, UserID)
  }

  UserID = Settings.getSync(SettingsUserIDKey)
  client.people.set(UserID, {
    version: `${pjson.version}`
  })
}

/*
 * trackEvent will send a new event with specific data
 */
export function trackEvent (eventName, data) {
  if (!UserID) {
    setUpUser()
  }

  if (!data) {
    data = {}
  }

  data.distinct_id = UserID
  data.version = `${pjson.version}`
  client.track(eventName, data)
}
