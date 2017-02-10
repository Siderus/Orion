import React from "react"
import { observer } from "mobx-react"

import { Pane } from "react-photonkit"

/**
 * Repository Panel
 */

@observer
class RepositoryPanel extends React.Component {
  render() {
    if(this.props.navigationStore.selected != 0) return null

    return (
      <Pane>
        <h1>Repository</h1>
      </Pane>
    )
  }
}

export default RepositoryPanel
