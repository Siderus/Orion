import React from 'react'
import ReactDom from 'react-dom'

import {
  startIPFS,
  getObjectDag,
  getObjectStat,
} from '../../api'
import { remote } from 'electron'
import queryString from 'query-string'
import cx from 'classnames'

// Load Components
import {
  Window,
  Toolbar,
  Actionbar,
  Button,
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
  }

  componentDidMount() {
    Promise.all([getObjectStat(hash), getObjectDag(hash)])
      .then(result => this.setState({
        stat: result[0],
        dag: result[1],
      }))
  }

  render() {
    const { currentTab, stat, dag } = this.state

    return (
      <Window>
        <div className='tab-group'>
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

startIPFS()
// Render the ImportWindow
ReactDom.render(<DetailsWindow />, document.querySelector('#host'))
