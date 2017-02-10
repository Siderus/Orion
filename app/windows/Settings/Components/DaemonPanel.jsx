import React from "react"
import { observer } from "mobx-react"

import { Pane } from "react-photonkit"

/**
 * Daemon Panel
 */

@observer
class DaemonPanel extends React.Component {
  render() {
    if(this.props.navigationStore.selected != 2) return null

    return (
      <Pane>
        <h1>Daemon</h1>
      </Pane>
    )
  }
}

export default DaemonPanel
