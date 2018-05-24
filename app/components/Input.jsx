import React from 'react'
import styled, { css } from 'styled-components'

const PhotonInput = ({ label, className, button, ...rest }) => {
  return (
    <div className={`form-group ${className}`}>
      <label>{label}</label>
      <input
        className="form-control"
        {...rest}
      />
      {button || false}
    </div>
  )
}

const Input = styled(PhotonInput)`
  ${props => props.button && css`
    .form-control {
      width: calc(100% - 37px);
    }
    button {
      margin-left: 5px;
      height: 31px;
    }
  `}
`

export default Input
