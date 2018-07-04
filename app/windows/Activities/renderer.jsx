import React from 'react'
import ReactDom from 'react-dom'
import { Window, Toolbar, Actionbar } from 'react-photonkit'
import Button from '../../components/Button'
import { ipcRenderer } from 'electron'
import ActivityList from './Components/ActivityList'
import { trackEvent } from '../../stats'

// This will store the loop's timeout ID
window.loopTimeoutID = null

class ActivitiesWindow extends React.Component {
  data = {
    activitiesById: [],
    activities: {}
  }

  componentDidMount () {
    trackEvent('ActivitiesWindowOpen', {})
    ipcRenderer.on('update', (event, data) => {
      this.data = data
    })

    ipcRenderer.send('update-activities')
    this.startUpdateLoop()
  }

  startUpdateLoop = () => {
    this.forceUpdate()
    // update with 50fps
    window.loopTimeoutID = setTimeout(this.startUpdateLoop, 20)
  }

  componentWillUnmount () {
    ipcRenderer.removeAllListeners('update')
    clearTimeout(window.loopTimeoutID)
  }

  handleClearActivities = () => {
    ipcRenderer.send('clear-activities')
  }

  render () {
    const { activities, activitiesById } = this.data

    return (
      <Window>
        <Toolbar>
          <Actionbar>
            <Button
              text='Clear'
              glyph='cancel-circled'
              onClick={this.handleClearActivities}
              pullRight
            />
          </Actionbar>
        </Toolbar>
        <ActivityList activities={activities} activitiesById={activitiesById} />
      </Window>
    )
  }
}

ReactDom.render(<ActivitiesWindow />, document.querySelector('#host'))
