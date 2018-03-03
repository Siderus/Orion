import React from 'react'
import { isEqual } from 'underscore'
import { observer } from 'mobx-react'

import StorageElement from './StorageElement'
import ResponsiveTable from '../../../components/ResponsiveTable'

@observer
class StorageList extends React.Component {
  render() {
    if (!this.props.storageStore) return <Table />

    let { elements, filters } = this.props.storageStore

    // Filters contains a list of functions
    filters.forEach((filter) => {
      elements = filter(elements)
    })

    return (
      <ResponsiveTable>
        <thead>
          <tr>
            <th></th>
            <th>ID</th>
            <th>Size</th>
            <th>Files</th>
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

      </ResponsiveTable>
    )
  }
}

export default StorageList
