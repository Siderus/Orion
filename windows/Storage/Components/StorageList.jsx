import React from "react"
import { observer } from "mobx-react"
import { Table } from "react-photonkit"

@observer
class StorageList extends Table {
  render() {
    if(!this.props.store) return <table className="table-striped"></table>

    let { elements, filters } = this.props.store

    // Filters contains a list of functions
    filters.forEach((filter) => {
      elements = filter(elements)}
    )

    return (
      <table className="table-striped">
        <thead>
          <tr>
            <th>Hash</th>
            <th>Size</th>
          </tr>
        </thead>

        <tbody>
          {
            elements.map((el)=> (
              <tr key={el.hash}>
                <td>{el.hash}</td>
                <td>{el.size || ""}</td>
              </tr>
            ))
          }
        </tbody>

      </table>
    )
  }
}

export default StorageList