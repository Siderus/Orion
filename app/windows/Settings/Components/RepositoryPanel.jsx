import React from "react"
import { observer } from "mobx-react"

import { Pane, Input, TextArea, Button } from "react-photonkit"

/**
 * Repository Panel
 */

@observer
class RepositoryPanel extends React.Component {
  _handelOnSubit(event){

  }

  render() {
    if(this.props.navigationStore.selected != 0) return null

    return (
      <Pane className="settings">
        <form onSubmit={this._handelOnSubit.bind(this)}>

          <Input
            label="Path of the Repository"
            type="text"
            value="/123"
            placeholder="Hey girl..." readOnly/>

          <Input
            label="Repository Size:"
            type="text"
            placeholder="Hey girl..." readOnly/>

            <Button ptSize="large" glyph="trash" text="Run Garbage Collector" />

        </form>
      </Pane>
    )
  }
}

export default RepositoryPanel
