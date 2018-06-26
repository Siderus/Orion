import React from 'react'
import ReactDom from 'react-dom'
import { Window } from 'react-photonkit'
import { ipcRenderer } from 'electron'

class ActivitiesWindow extends React.Component {
  state = {
    activitiesById: [],
    activities: {}
  }

  componentDidMount () {
    ipcRenderer.on('update', (event, data) => {
      console.log('hello from main')
      this.setState(data)
    })
    ipcRenderer.send('update-activities')
  }
  componentWillUnmount () {
    ipcRenderer.removeAllListeners('update')
  }

  render () {
    const { activities, activitiesById } = this.state
    console.log('render', activitiesById, activities)

    return (
      <Window>
        {
          activitiesById.map(id => JSON.stringify(activities[id]))
        }
      </Window>
    )
  }
}

ReactDom.render(<ActivitiesWindow />, document.querySelector('#host'))
