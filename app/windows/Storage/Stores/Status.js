import { observable } from 'mobx'

/**
 * StatusStorage will contain the status of the IPFS Daemon. Speccifically it
 * will provide the following data:
 *  - Peers: an array of peers available
 *  - Repo stats: the statistics of the repository
 *
 * This is used by the API and React
 */
export class StatusStorage {
  @observable peers = []
  @observable stats = []
}

export default new StatusStorage()
