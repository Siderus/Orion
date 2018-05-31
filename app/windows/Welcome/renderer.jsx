import React from 'react'
import ReactDom from 'react-dom'
import Settings from 'electron-settings'

import WelcomePage from './Components/WelcomePage'
// import ServicesPage from './Components/ServicesPage'
import StatsPage from './Components/StatsPage'

class WelcomeWindow extends React.Component {
  state = {
    pageIndex: 0
  }

  handleNext = () => {
    this.setState({ pageIndex: this.state.pageIndex + 1 })
  }

  handleQuit = () => {
    Settings.setSync('welcomeVersion', 1)
    window.close()
  }

  render () {
    const { pageIndex } = this.state
    switch (pageIndex) {
      case 1:
        return <StatsPage onNext={this.handleQuit} />
      // case 2:
      //   return <ServicesPage onNext={this.handleQuit} />
      default:
        return <WelcomePage onNext={this.handleNext} />

    }
  }
}

ReactDom.render(<WelcomeWindow />, document.querySelector('#host'))
