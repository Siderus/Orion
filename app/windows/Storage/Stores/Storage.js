import { observable } from "mobx"

/**
 * StorageStore will contain observable elements that will be used by React
 * and by the API to show the pinned objects in the IPFS Daemon's repo.
 */
export class StorageStore {
  @observable elements = []
  @observable filters = []
  @observable selected = []
}

export default new StorageStore