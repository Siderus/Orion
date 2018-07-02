import React from 'react'
import ReactDom from 'react-dom'
import { Window } from 'react-photonkit'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'
import Activity from './Components/Activity'

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
`

// This will store the loop's timeout ID
window.loopTimeoutID = null

class ActivitiesWindow extends React.Component {
  data = {
    activitiesById: [],
    activities: {}
  }

  componentDidMount () {
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

  render () {
    const { activities, activitiesById } = this.data

    return (
      <Window>
        <ActivityList>
          {
            activitiesById.map(id => <Activity key={id} activity={activities[id]} />)
          }
        </ActivityList>
      </Window>
    )
  }
}

ReactDom.render(<ActivitiesWindow />, document.querySelector('#host'))
