import { observable } from "mobx"

/**
 * StatStorage will contain the status and few information about the Object.
 * It has the following values:
 *  - hash: the hash of the object/file to obtain
 *  - peersAmount: the amount of peers that have this hash
 *  - stats: information about this Object/File
 *
 * This is used by the API and React
 */
export class StatStorage {
  @observable hash = ""
  @observable peersAmount = 0
  @observable stats = {}
}

export default new StatStorage