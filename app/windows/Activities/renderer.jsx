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

class ActivitiesWindow extends React.Component {
  state = {
    activitiesById: [],
    activities: {}
  }

  componentDidMount () {
    ipcRenderer.on('update', (event, data) => {
      this.setState(data)
    })
    ipcRenderer.send('update-activities')
  }
  componentWillUnmount () {
    ipcRenderer.removeAllListeners('update')
  }

  render () {
    const { activities, activitiesById } = this.state

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
