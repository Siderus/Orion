import React from 'react'
import { Toolbar } from 'react-photonkit'
import { observer } from 'mobx-react'
import Spinner from 'react-spin'
import styled from 'styled-components'

const Wrapper = styled.div`
 footer {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
 }
`

@observer
class Footer extends React.Component {
  render () {
    const { statusStore } = this.props

    const title = statusStore.connected ? 'Connected' : 'Connecting...'

    return (
      <Wrapper>
        <Toolbar ptType="footer" title={title}>
          {
            statusStore.connected
              ? null
              : <Spinner config={{
                scale: 0.3,
                lines: 8,
                left: '-15px',
                top: '10px',
                color: '#808080',
                position: 'relative'
              }} />
          }
        </Toolbar>
      </Wrapper>
    )
  }
}

export default Footer
