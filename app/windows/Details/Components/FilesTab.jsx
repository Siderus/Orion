import React from 'react'

/**
 * Files tab shows the objects links within a table,
 * this information includes: id, name and size
 */
function FilesTab({ links }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {
          links.map(link => (
            <tr key={link.multihash}>
              <td>{link.multihash}</td>
              <td>{link.name}</td>
              <td>{link.size.value} {link.size.unit}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

export default FilesTab
