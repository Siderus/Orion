import React from 'react'
import ReactDom from 'react-dom'

import {
  initIPFSClient,
  getObjectDag,
  getObjectStat,
  saveFileToPath,
  isObjectPinned,
  pinObject,
  promiseIPFSReady,
  unpinObject
} from '../../api'
import { openInBrowser } from '../Storage/fileIntegration'
import { remote } from 'electron'
import queryString from 'query-string'
import cx from 'classnames'
import { Window, Toolbar, Actionbar, ButtonGroup } from 'react-photonkit'
import Button from '../../components/Button'
import { trackEvent } from '../../stats'

// Load Components
import InformationTab from './Components/InformationTab'
import FilesTab from './Components/FilesTab'

const query = queryString.parse(window.location.search)
const { hash } = query

/**
 * Show detailed information about a object, from its hash
 */
class DetailsWindow extends React.Component {
  state = {
    currentTab: 0
  }

  componentDidMount () {
    trackEvent('DetailsWindowOpen', {})
    promiseIPFSReady().then(this.fetchData)
  }

  fetchData = () => {
    Promise.all([
      getObjectStat(hash),
      getObjectDag(hash),
      isObjectPinned(hash)
    ])
      .then(result => this.setState({
        stat: result[0],
        dag: result[1],
        isPinned: result[2]
      }))
  }

  handleDownload = () => {
    const options = {
      title: 'Where should I save?',
      properties: ['openDirectory'],
      buttonLabel: 'Save here'
    }

    // This returns an array
    const response = remote.dialog.showOpenDialog(remote.app.mainWindow, options)
    if (response) {
      const destination = response[0]

      this.setState({ isSavingOnDisk: true })
      saveFileToPath(hash, destination)
        .then(result => this.setState({ isSavingOnDisk: false }))
        .catch(err => {
          remote.dialog.showErrorBox('Saving to disk has failed', err.message)
          this.setState({ isSavingOnDisk: false })
        })
    }
  }

  handleOpenInBrowser = () => {
    openInBrowser([hash])
  }

  handlePin = () => {
    this.setState({ isUpdatingPin: true })
    pinObject(hash)
      .then(result => this.setState({ isPinned: true, isUpdatingPin: false }))
      .catch(err => {
        remote.dialog.showErrorBox('Pinning has failed', err.message)
        this.setState({ isUpdatingPin: false })
      })
  }

  handleUnpin = () => {
    this.setState({ isUpdatingPin: true })
    unpinObject(hash)
      .then(result => this.setState({ isPinned: false, isUpdatingPin: false }))
      .catch(err => {
        remote.dialog.showErrorBox('Unpinning has failed', err.message)
        this.setState({ isUpdatingPin: false })
      })
  }

  render () {
    const { currentTab, isPinned, isSavingOnDisk, isUpdatingPin, stat, dag } = this.state

    return (
      <Window>
        <Toolbar>
          <Actionbar>
            <ButtonGroup>
              <Button
                loading={isSavingOnDisk}
                loadingText='Saving on disk...'
                text='Save on disk'
                glyph='download'
                onClick={this.handleDownload}
              />
              {
                isPinned
                  ? <Button
                    loading={isUpdatingPin}
                    loadingText='Unpinning...'
                    text='Unpin'
                    glyph='minus-circled'
                    onClick={this.handleUnpin}
                  />
                  : <Button
                    loading={isUpdatingPin}
                    loadingText='Pinning...'
                    text='Pin'
                    glyph='plus-circled'
                    onClick={this.handlePin}
                  />
              }
            </ButtonGroup>
            <Button
              text="Open in Browser"
              glyph='publish'
              onClick={this.handleOpenInBrowser}
              pullRight
            />
          </Actionbar>
        </Toolbar>

        <div className='tab-group' style={{ minHeight: '27px' }}>
          <div
            className={cx('tab-item', { active: currentTab === 0 })}
            onClick={() => this.setState({ currentTab: 0 })}
          >
            Information
          </div>
          <div
            className={cx('tab-item', { active: currentTab === 1 })}
            onClick={() => this.setState({ currentTab: 1 })}
          >
            Files
          </div>
        </div>
        {
          currentTab === 0 && stat &&
          <InformationTab stat={stat} hash={hash} />
        }
        {
          currentTab === 1 && dag &&
          <FilesTab links={dag.links} />
        }
      </Window>
    )
  }
}

initIPFSClient()
// Render the ImportWindow
ReactDom.render(<DetailsWindow />, document.querySelector('#host'))
