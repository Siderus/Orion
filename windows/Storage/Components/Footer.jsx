import React from "react"
import { Toolbar } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {
  render() {
    let elements = []
    if(this.props.store){
      if(this.props.store.peers.length > 0)
        elements.push(`Peers: ${this.props.store.peers.length}`)

      if(this.props.store.stats.RepoSize){
        let repoSize = this.props.store.stats.RepoSize

        elements.push(`Space: ${repoSize.value} ${repoSize.unit}`)
      }
    }
    let title = elements.join(" - ") || "Waiting for IPFS..."

    return (
      <Toolbar ptType="footer" title={title}>
      </Toolbar>
    )
  }
}

export default Footer