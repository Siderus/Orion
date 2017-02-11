import { observable } from "mobx"

/**
 * This store will contain the data provided by the API, in order to render
 * correctly all the components.
 */
export class InformationStore {
  @observable peers = []
  @observable peerId = ""

  reset(){
    this.peers = []
    this.peerId = ""
  }
}

export default new InformationStore