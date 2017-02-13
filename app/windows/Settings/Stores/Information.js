import { observable } from "mobx"

import { getPeersInfo, getPeer, getRepoInfo } from "../../../api"

/**
 * This store will contain the data provided by the API, in order to render
 * correctly all the components.
 */
export class InformationStore {
  @observable peers = []
  @observable peer = {}
  @observable repoStats = {}

  loadData(){
    let promises = []
    promises.push(getPeer().then(peer => this.peer = peer))
    promises.push(getPeersInfo().then(peers => this.peers = peers))
    promises.push(getRepoInfo().then(stats => this.repoStats = stats))

    Promise.all(promises)
  }
}

export default new InformationStore