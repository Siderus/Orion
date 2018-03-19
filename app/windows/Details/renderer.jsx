import React from 'react'
import ReactDom from 'react-dom'

import {
  initIPFSClient,
  getObjectDag,
  getObjectStat,
  saveFileToPath,
  isObjectPinned,
  pinObject,
  unpinObject
} from '../../api'
import { openInBrowser } from '../Storage/fileIntegration'
import { remote } from 'electron'
import queryString from 'query-string'
import cx from 'classnames'
import { Toolbar, Actionbar, Button, ButtonGroup } from 'react-photonkit'

// Load Components
import {
  Window,
} from 'react-photonkit'

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

  constructor(props) {
    super(props)

    this.handleDownload = this.handleDownload.bind(this)
    this.handleOpenInBrowser = this.handleOpenInBrowser.bind(this)
    this.handlePin = this.handlePin.bind(this)
    this.handleUnpin = this.handleUnpin.bind(this)
  }

  componentDidMount() {
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

  handleDownload() {
    const options = {
      title: 'Where should I save?',
      properties: ['openDirectory'],
      buttonLabel: 'Save here'
    }

    // This returns an array
    const response = remote.dialog.showOpenDialog(remote.app.mainWindow, options)
    if (response) {
      const destination = response[0]
      saveFileToPath(hash, destination)
    }
  }

  handleOpenInBrowser() {
    openInBrowser([hash])
  }

  handlePin() {
    pinObject(hash).then(result => this.setState({ isPinned: true }))
  }

  handleUnpin() {
    unpinObject(hash).then(result => this.setState({ isPinned: false }))
  }

  render() {
    const { currentTab, isPinned, stat, dag } = this.state

    return (
      <Window>
        <Toolbar title='Properties'>
          <Actionbar>
            <ButtonGroup>
              <Button text="Download" glyph='download' onClick={this.handleDownload} />
              {
                isPinned
                  ? <Button text="Unpin" glyph='minus-circled' onClick={this.handleUnpin} />
                  : <Button text="Pin" glyph='plus-circled' onClick={this.handlePin} />
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
