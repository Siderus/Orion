import { observable } from "mobx"

/**
 * This will store the Navigation panel, to show/hide the window's content
 * accordingly.
 */
export class NavigationStore {
  @observable selected = ""

  reset(){
    this.selected = ""
  }
}

export default new NavigationStore