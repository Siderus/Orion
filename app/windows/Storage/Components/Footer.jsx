import React from "react"
import { Toolbar } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {
  render() {
    let title = "Waiting for IPFS... Is the daemon enabled in the settings?"
    if(this.props.statusStore){
      if(this.props.statusStore.peers.length > 0)
        title = "Connected"
    }

    return (
      <Toolbar ptType="footer" title={title}></Toolbar>
    )
  }
}

export default Footer