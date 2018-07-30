import React from 'react'
import { Content, Button } from 'react-photonkit'
import Input from '../../../components/Input'
import Table from '../../../components/Table'

const _handleCopyToClipboard = (event) => {
  event.preventDefault()
  const input = document.getElementById('hash-input')
  input.select()
  document.execCommand('copy')
}

/**
 * InformationTab shows the object's stats,
 * i.e. id, data, number of links, cumulative size
 *
 */
function InformationTab ({ stat, hash }) {
  return (
    <Content>
      <h5 className='nav-group-title'>Information</h5>
      <Table>
        <tbody>
          <tr>
            <td>ID:</td>
            <td>
              <Input
                id='hash-input'
                type="text"
                value={hash}
                // using onChange instead of readOnly to allow the input to be selected
                onChange={() => { }}
                button={
                  <Button
                    glyph='doc-text'
                    onClick={_handleCopyToClipboard}
                  />
                }
              />
            </td>
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
      </Table>
    </Content>
  )
}

export default InformationTab
