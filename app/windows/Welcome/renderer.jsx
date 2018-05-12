import React from 'react'
import ReactDom from 'react-dom'

import WelcomePage from './Components/WelcomePage'
import TermsOfServicePage from './Components/TermsOfServicePage'
import { remote } from 'electron'
import Settings from 'electron-settings'

class WelcomeWindow extends React.Component {
  state = {
    page: 0
  }

  handleNext = () => {
    this.setState({ page: 1 })
  }

  handleQuit = () => {
    window.close()
  }

  handleAccept = () => {
    Settings.setSync('userAgreement', true)
    remote.app.emit('start-orion')
    window.close()
  }

  render () {
    const { page } = this.state

    return (
      page === 0
        ? <WelcomePage onNext={this.handleNext} />
        : <TermsOfServicePage onQuit={this.handleQuit} onAccept={this.handleAccept} />
    )
  }
}

ReactDom.render(<WelcomeWindow />, document.querySelector('#host'))
