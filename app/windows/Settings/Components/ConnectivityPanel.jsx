import React from 'react'
import { observer } from 'mobx-react'

import { Pane, Input, TextArea } from 'react-photonkit'

/**
 * Connectivity Panel
 */

@observer
class ConnectivityPanel extends React.Component {

  _handelOnSubit(event) {

  }

  render() {
    if (this.props.navigationStore.selected != 1) return null
    if (!this.props.informationStore) return null
    if (!this.props.informationStore.loaded) return null

    const data = this.props.informationStore
    // const peers = data.peers.map(peer => peer.addr.toString()).join("   ")
    return (
      <Pane className="settings">
        <form onSubmit={this._handelOnSubit.bind(this)}>

          <Input
            label="Your peer ID"
            type="text"
            value={data.peer.id || '...'}
            placeholder="Hey girl..." readOnly
          />

          <Input
            label="Number of peers connected"
            type="text"
            value={data.peers.length || 0}
            placeholder="Hey girl..." readOnly
          />

          {/*<TextArea
            label="Peers connected"
            value={peers}
            placeholder="Hey girl..." readOnly>
          </TextArea>*/}
        </form>
      </Pane>
    )
  }
}

export default ConnectivityPanel
