import Table from './Table'
import styled from 'styled-components'

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
`

export default ResponsiveTable
