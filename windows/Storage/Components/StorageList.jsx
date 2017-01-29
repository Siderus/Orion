import React from "react"
import { isEqual } from "underscore"
import { observer } from "mobx-react"
import { Table } from "react-photonkit"

@observer
class StorageList extends Table {

  _handleCheckboxOnClick(element, proxy, event){
    if(this.props.storageStore.selected.find((el) => isEqual(el, element))){
      console.log("o")
      this.props.storageStore.selected.remove(element)
    }else{
      console.log("added")
      this.props.storageStore.selected.push(element)
    }
  }

  render() {
    if(!this.props.storageStore) return <table className="table-striped"></table>

    let { elements, filters } = this.props.storageStore

    // Filters contains a list of functions
    filters.forEach((filter) => {
      elements = filter(elements)}
    )

    return (
      <table className="table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Size</th>
          </tr>
        </thead>

        <tbody>
          {
            elements.map((el)=> (
              <tr key={el.hash}>
                <td><input onClick={this._handleCheckboxOnClick.bind(this, el)} type="checkbox"/> {el.hash}</td>
                <td>{el.stat.CumulativeSize.value || ""} {el.stat.CumulativeSize.unit || ""}</td>
              </tr>
            ))
          }
        </tbody>

      </table>
    )
  }
}

export default StorageList