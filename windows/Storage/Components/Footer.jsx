import React from "react"
import { Toolbar } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {
  render() {
    let elements = []
    if(this.props.statusStore){
      if(this.props.statusStore.peers.length > 0)
        elements.push(`Peers: ${this.props.statusStore.peers.length}`)

      if(this.props.statusStore.stats.RepoSize){
        let repoSize = this.props.statusStore.stats.RepoSize

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