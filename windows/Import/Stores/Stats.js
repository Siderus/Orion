import { observable } from "mobx"

/**
 * StatStorage will contain the status and few information about the Object.
 *
 * This is used by the API and React
 */
export class StatStorage {
  @observable hash = ""
  @observable peers = 0
  @observable stats = {}
}

export default new StatStorage