import { observable } from "mobx"

/**
 * This will store the Navigation panel, to show/hide the window's content
 * accordingly.
 */
export class NavigationStore {
  @observable selected = 0

  reset(){
    this.selected = 0
  }
}

export default new NavigationStore