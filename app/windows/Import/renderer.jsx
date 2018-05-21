import React from 'react'
import ReactDom from 'react-dom'

import { initIPFSClient } from '../../api'
import { trackEvent } from '../../stats'

// Load Components
import { Window, Content } from 'react-photonkit'

// Load Custom Components
import Form from './Components/Form'
import Stats from './Components/Stats'
import Footer from './Components/Footer'

// Load MobX Stores
import StatsStore from './Stores/Stats'

class ImportWindow extends React.Component {
  componentDidMount () {
    trackEvent('ImportIPFSWindowOpen', {})
  }

  render () {
    return (
      <Window>
        <Content>
          <Form statsStore={StatsStore} />
          <Stats statsStore={StatsStore} />
        </Content>

        <Footer statsStore={StatsStore} />
      </Window>
    )
  }
}

initIPFSClient()
// Render the ImportWindow
ReactDom.render(<ImportWindow />, document.querySelector('#host'))
