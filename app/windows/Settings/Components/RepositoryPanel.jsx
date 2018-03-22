import React from 'react'
import { observer } from 'mobx-react'

import { Pane, Input, TextArea, Button } from 'react-photonkit'

import { runGarbageCollector } from '../../../api'

/**
 * Repository Panel
 */

@observer
class RepositoryPanel extends React.Component {
  /** Perform garbage collector and reload the view when done */
  _handleButtonGarbageCollectorClick (event) {
    runGarbageCollector()
      .then(this.props.informationStore.loadData)
      .then(this.forceUpdate)
  }

  _handelOnSubit (event) {

  }

  render () {
    if (this.props.navigationStore.selected !== 0) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const data = this.props.informationStore.repoStats
    const repoSize = `${data.RepoSize.value} ${data.RepoSize.unit}`

    return (
      <Pane className="settings">
        <form onSubmit={this._handelOnSubit.bind(this)}>

          <Input
            label="Path of the Repository"
            type="text"
            value={data.RepoPath || "$HOME... maybe? Whatever, it's 2009!"}
            placeholder="Hey girl..." readOnly
          />

          <Input
            label="Repository Size:"
            type="text"
            value={repoSize}
            placeholder="Hey girl..." readOnly
          />

          <Button
            onClick={this._handleButtonGarbageCollectorClick.bind(this)}
            ptSize="large"
            glyph="trash"
            text="Run Garbage Collector"
          />

        </form>
      </Pane>
    )
  }
}

export default RepositoryPanel
