import React from 'react'
import styled, { keyframes, css } from 'styled-components'

const indeterminate = keyframes`
  0%   { margin-left: 0%; }
  50%  { margin-left: 50%; }
  100% { margin-left: 0%; }
`

const ProgressBarRoot = styled.div`
  width: 100%;
  background-color: rgb(191,191,191);
  padding: 1px;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
  overflow: hidden;

  span {
    width: ${props => props.percentage}%;
    display: block;
    height: 4px;
    background-color: rgb(127,127,127);
    border-radius: 5px;
    transition: width 250ms ease-in-out;

    ${props => props.indeterminate && css`
      animation: ${indeterminate} 1.5s linear infinite;
    `}
  }
`

const ProgressBar = ({ percentage = 0, indeterminate }) => (
  <ProgressBarRoot percentage={indeterminate ? 50 : percentage} indeterminate={indeterminate}>
    <span></span>
  </ProgressBarRoot>
)

export default ProgressBar
