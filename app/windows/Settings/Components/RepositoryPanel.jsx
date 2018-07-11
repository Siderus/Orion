import React from 'react'
import { observer } from 'mobx-react'

import { Pane, Button } from 'react-photonkit'
import Input from '../../../components/Input'

import { runGarbageCollector } from '../../../api'
import { remote } from 'electron'

const IPFS_REPO_PATH = remote.getGlobal('IPFS_REPO_PATH')

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

  _handleOpenRepoDir = (event) => {
    event.preventDefault()
    remote.shell.openItem(IPFS_REPO_PATH)
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
          label="Repository Path:"
          type="text"
          value={IPFS_REPO_PATH}
          // using onChange instead of readOnly to allow the input to be selected
          onChange={() => { }}
          button={
            <Button
              text="Open"
              glyph='folder'
              onClick={this._handleOpenRepoDir}
            />
          }
        />
        <Input
          label="Repository Size:"
          type="text"
          value={repoSize || 'Loading...'}
          // using onChange instead of readOnly to allow the input to be selected
          onChange={() => { }}
          button={
            <Button
              text="Run Garbage Collector"
              glyph='trash'
              onClick={this._handleButtonGarbageCollectorClick}
            />
          }
        />
      </Pane>
    )
  }
}

export default RepositoryPanel
