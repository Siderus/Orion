import React from 'react'
import styled from 'styled-components'

const PhotonTable = (props) => <table {...props} className={`table-striped ${props.className}`} />

const Table = styled(PhotonTable)`
  tr.active {
    color: #fff;
    background-color: #3260d6;
  }
`

export default Table
