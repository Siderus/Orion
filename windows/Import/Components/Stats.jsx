import React from "react"
import { observer } from "mobx-react"

@observer
class Stats extends React.Component {
  render() {
    let store = this.props.statsStore

    if(store.isLoading) return <div>
      Loading... this may take a while depending how distributed is the hash in
      the network and the speed of the nodes having it.
    </div>

    if(!store.isValid || !store.wasLoadingStats) return <div></div>

    const CumSize = {value: "", unit: ""}

    let CumulativeSize = store.stats.CumulativeSize || CumSize

    return (
      <div>
        <p>Peers with this Hash: {store.peersAmount || "..."}</p>
        <p>Object/files size: {CumulativeSize.value} {CumulativeSize.unit}</p>
      </div>
    )
  }
}

export default Stats