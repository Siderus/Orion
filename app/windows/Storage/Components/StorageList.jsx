import React from 'react'
import { isEqual } from 'underscore'
import { observer } from 'mobx-react'

import StorageElement from './StorageElement'
import styled from 'styled-components'

import Table from '../../../components/Table'

const ResponsiveTable = styled(Table)`
  table-layout:fixed;
  min-width: 700px;

  th:nth-child(1) {
    width: 35px;
  }

  th:nth-child(2) {
    width: 400px;
  }

  th:nth-child(3) {
    width: 85px;
  }

  th:nth-child(4) {
    width: 100%;
  }
`;


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
