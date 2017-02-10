import React from "react"
import { observer } from "mobx-react"

import { Pane } from "react-photonkit"

/**
 * Render a Dynamic Panel based on the NavigatorStore.
 */

@observer
class DynamicPanel extends React.Component {
  _handleSelect(selected){
    this.props.navigationStore.selected = selected
  }

  render() {
    let selected = this.props.navigationStore.selected
    return (
      <Pane>
        {selected}
      </Pane>
    )
  }
}

export default DynamicPanel
