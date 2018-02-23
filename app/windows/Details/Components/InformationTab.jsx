import React from 'react'

/**
 * InformationTab shows the object's stats,
 * i.e. id, data, number of links, cumulative size
 *
 */
function InformationTab({ stat, hash }) {
  return (
    <div>
      <h5 className='nav-group-title'>Information</h5>
      <table>
        <tbody>
          <tr>
            <td>ID:</td>
            <td>{hash}</td>
          </tr>
          <tr>
            <td>Data size:</td>
            <td>{stat.DataSize.value} {stat.DataSize.unit}</td>
          </tr>
          <tr>
            <td>Number of links:</td>
            <td>{stat.NumLinks}</td>
          </tr>
          <tr>
            <td>Cumulative size:</td>
            <td>{stat.CumulativeSize.value} {stat.CumulativeSize.unit}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default InformationTab
