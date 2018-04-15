// import { Button as BaseButton } from 'react-photonkit'
import React from 'react'
import styled, { css } from 'styled-components'
import cx from 'classnames'
import Spinner from 'react-spin'

const PhotonButton = ({ className, loading, loadingText, glyph, text, pullRight, ...rest }) => {
  return (
    <button
      {...rest}
      disabled={loading}
      className={cx('btn btn-default disabled', className, { 'pull-right': pullRight })}
    >
      {
        loading
          ? <Spinner config={{ scale: 0.3, lines: 8, left: '15px', color: '#808080' }} />
          : <span className={`icon icon-${glyph} icon-text`}></span>
      }
      {
        loading
          ? loadingText
          : text
      }
    </button>
  )
}

const Button = styled(PhotonButton)`
  ${props => props.loading && css`
    span {
      margin-right: 20px;
    }

    color: #808080;
  `}
`

export default Button
