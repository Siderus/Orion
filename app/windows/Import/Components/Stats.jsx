import React from 'react'
import { observer } from 'mobx-react'

@observer
class Stats extends React.Component {
  render () {
    const store = this.props.statsStore

    // ToDo: show a different message when importing
    if (store.isLoading || store.importing) {
      return (
        <div>
        Loading... this may take a while depending how distributed is the hash in
        the network and the speed of the nodes having it.
        </div>
      )
    }

    if (!store.isValid || !store.wasLoadingStats) { return <div></div> }

    const DefaultCumSize = { value: 'Loading...', unit: '' }

    const CumulativeSize = store.stats.CumulativeSize || DefaultCumSize

    return (
      <div className="stats">
        <p>Peers with this Object: <b>{store.peersAmount || 'Loading...'}</b></p>
        <p>Object cumulative size: <b>{CumulativeSize.value} {CumulativeSize.unit}</b></p>
      </div>
    )
  }
}

export default Stats
