import React from "react"
import { Toolbar } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {
  render() {
    let title = ""
    if(this.props.store){
      if(this.props.store.peers.length > 0)
        title += ` Peers: ${this.props.store.peers.length}`

      if(this.props.store.stats.RepoSize){
        let repoSize = this.props.store.stats.RepoSize

        title += ` Space: ${repoSize.value} ${repoSize.unit}`
      }
    }

    return (
      <Toolbar ptType="footer" title={title}>
      </Toolbar>
    )
  }
}

export default Footer