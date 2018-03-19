import React from 'react'
import styled from 'styled-components'

const ProgressBarRoot = styled.div`
  width: 100%;
  background-color: rgb(191,191,191);
  padding: 1px;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);

  span {
    width: ${props => props.percentage}%;
    display: block;
    height: 4px;
    background-color: rgb(127,127,127);
    border-radius: 5px;
    transition: width 250ms ease-in-out;
  }
`

const ProgressBar = ({ percentage = 0 }) => (
  <ProgressBarRoot percentage={percentage}>
    <span></span>
  </ProgressBarRoot>
)

export default ProgressBar
