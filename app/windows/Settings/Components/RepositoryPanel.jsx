import React from 'react'
import { observer } from 'mobx-react'

import { Pane, Input, Button } from 'react-photonkit'

import { runGarbageCollector } from '../../../api'

/**
 * Repository Panel
 */

@observer
class RepositoryPanel extends React.Component {
  /** Perform garbage collection and refetch the data when done */
  _handleButtonGarbageCollectorClick = (event) => {
    event.preventDefault()
    runGarbageCollector()
      .then(() => this.props.informationStore.loadData())
  }

  render () {
    if (this.props.navigationStore.selected !== 1) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const data = this.props.informationStore.repoStats
    const repoSize = `${data.RepoSize.value} ${data.RepoSize.unit}`

    return (
      <Pane className="settings">
        <Input
          label="Repository Size:"
          type="text"
          value={repoSize}
          placeholder="Hey girl..." readOnly
        />

        <Button
          onClick={this._handleButtonGarbageCollectorClick}
          ptSize="large"
          glyph="trash"
          text="Run Garbage Collector"
        />
      </Pane>
    )
  }
}

export default RepositoryPanel
