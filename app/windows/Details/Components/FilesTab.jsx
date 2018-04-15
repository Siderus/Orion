import React from 'react'
import styled from 'styled-components'

import {
  getStorageList
} from '../../../api'

import ResponsiveTable from '../../../components/ResponsiveTable'
import StorageElement from '../../Storage/Components/StorageElement'

const TableContainer = styled.div`
  overflow-y: auto;
  flex: 1;
`

/**
 * Files tab shows the objects links within a table,
 * this information includes: id, name and size
 */
class FilesTab extends React.Component {
  constructor (props) {
    super(props)

    this.state = {}
    this.state.formattedLinks = []
  }

  componentDidMount () {
    // Check all the links/dags
    const newLinks = this.props.links.map(el => {
      return {
        hash: el.multihash,
        name: el.name
      }
    })

    getStorageList(newLinks).then(list => {
      this.setState({ formattedLinks: list })
    })
  }

  render () {
    return (
      <TableContainer>
        <ResponsiveTable>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Size</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.formattedLinks.map((el) => (
                <StorageElement
                  element={el}
                  key={el.hash}
                />
              ))
            }
          </tbody>

        </ResponsiveTable>
      </TableContainer>
    )
  }
}
export default FilesTab
