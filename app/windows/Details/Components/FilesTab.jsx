import React from 'react'

function FilesTab({ dag }) {
  return (
    <div>
      <h5 className='nav-group-title'>Files</h5>
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
            dag.links.map(link => (
              <tr key={link.multihash}>
                <td>{link.multihash}</td>
                <td>{link.name}</td>
                <td>{link.size.value} {link.size.unit}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default FilesTab
