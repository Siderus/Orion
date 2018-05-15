import React from 'react'
import Settings from 'electron-settings'
import { observer } from 'mobx-react'

import { Pane, CheckBox } from 'react-photonkit'

/**
 * Repository Panel
 */
@observer
class AppPanel extends React.Component {
  state = {
    runInBackground: true
  }

  componentWillMount () {
    /**
     * Retrieve settings from persistent storage
     */
    let runInBackground = Settings.getSync('runInBackground')
    if (typeof runInBackground !== 'boolean') {
      // the default is true
      runInBackground = true
    }
    this.setState({ runInBackground })
  }

  _handleRunInBackgroundChange = (event) => {
    const nextValue = !this.state.runInBackground
    /**
     * Save setting persistently
     */
    Settings.setSync('runInBackground', nextValue)
    /**
     * Update component's state
     */
    this.setState({
      runInBackground: nextValue
    })
  }

  render () {
    if (this.props.navigationStore.selected !== 2) return null

    return (
      <Pane className="settings">
        <CheckBox
          label="Let the app run in background"
          checked={this.state.runInBackground}
          onChange={this._handleRunInBackgroundChange}
        />
      </Pane>
    )
  }
}

export default AppPanel
