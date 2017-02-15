import React from 'react'
import { isEqual } from 'underscore'
import { observer } from 'mobx-react'
import { Table } from 'react-photonkit'

import StorageElement from './StorageElement'

@observer
class StorageList extends Table {
  render() {
    if (!this.props.storageStore) return <table className="table-striped" />

    let { elements, filters } = this.props.storageStore

    // Filters contains a list of functions
    filters.forEach((filter) => {
      elements = filter(elements)
    })

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
            elements.map((el) => (
              <StorageElement
                element={el}
                storageStore={this.props.storageStore}
                key={el.hash}
              />
            ))
          }
        </tbody>

      </table>
    )
  }
}

export default StorageList
