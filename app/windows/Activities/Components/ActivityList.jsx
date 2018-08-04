import React from 'react'
import Table from '../../../components/Table'
import AddActivity from './AddActivity'
import ImportActivity from './ImportActivity'
import styled from 'styled-components'

const ResponsiveTable = styled(Table)`
  table-layout:fixed;
  min-width: 700px;

  th:nth-child(1) {
    width: 60px;
  }

  th:nth-child(2) {
    width: 300px;
  }

  th:nth-child(3) {
    text-align: right;
    width: 200px;
  }

  th:nth-child(4) {
    text-align: right;
    width: 140px;
  }
`

const TableContainer = styled.div`
  overflow-y: auto;
  flex: 1;
`

const ActivityList = ({ activities, activitiesById }) => (
  <TableContainer>
    <ResponsiveTable>
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>Progress</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {
          activitiesById.map(id => (
            activities[id].type === 'add'
              ? <AddActivity key={id} activity={activities[id]} />
              : <ImportActivity key={id} activity={activities[id]} />
          ))
        }
      </tbody>
    </ResponsiveTable>
  </TableContainer>
)

export default ActivityList
