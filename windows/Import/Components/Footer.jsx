import { remote } from 'electron'

import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"
import { observer } from "mobx-react"

import { getPeersWithObjectbyHash, importObjectByHash } from '../../../app/api'
import { getObjectStat } from '../../../app/api'

@observer
class Footer extends React.Component {

  _handleCheckButton (){
    let storage = this.props.statsStore

    // Prepare the promise to check the Peers
    let pPeers = getPeersWithObjectbyHash(storage.hash)
      .then(peers => {
        storage.peersAmount = peers.length
        storage.isLoading = false
        this.forceUpdate()
      })

    // Prepare the promise to check the stats
    let pStats = getObjectStat(storage.hash)
      .then(stats => {
        storage.stats = stats
        storage.isLoading = false
        this.forceUpdate()
      })

    storage.isLoading = true
    storage.wasLoadingStats = true
    // Now race! The first one shows stuff!
    Promise.race([pPeers, pStats])
    .catch(err => {
      storage.isLoading = false
      remote.dialog.showErrorBox('Gurl, an error occurred', `${err}`)
    })
  }

  _handleImportButton (){
    let storage = this.props.statsStore

    storage.isLoading = true

    importObjectByHash(storage.hash).then(()=>{
      // Object added. Yay!
      window.close()
    })
    .catch(err => {
      storage.isLoading = false
      remote.dialog.showErrorBox('Gurl, an error occurred!', `${err}`)
    })
  }


  render() {
    let storage = this.props.statsStore
    let rightButton = null

    if(!storage.isLoading && storage.isValid)
      rightButton = <Button onClick={this._handleCheckButton.bind(this)} text="Check" ptStyle="primary" pullRight/>

    if(!storage.isLoading && storage.wasLoadingStats)
      rightButton = <Button onClick={this._handleImportButton.bind(this)} text="Import" ptStyle="primary" pullRight/>

    return (
      <Toolbar ptType="footer">
        <Actionbar>
          <Button text="Close" ptStyle="default" onClick={window.close} />
          {rightButton}
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Footer