import React from "react"
import { observer } from "mobx-react"

import { Pane } from "react-photonkit"

/**
 * Connectivity Panel
 */

@observer
class ConnectivityPanel extends React.Component {
  render() {
    if(this.props.navigationStore.selected != 1) return null

    return (
      <Pane>
        <h1>Connectivity</h1>
      </Pane>
    )
  }
}

export default ConnectivityPanel
