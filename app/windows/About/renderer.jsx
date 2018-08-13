import React from 'react'
import ReactDom from 'react-dom'
import { shell } from 'electron'
import styled from 'styled-components'
import 'react-photonkit'

import { trackEvent } from '../../stats'
import OrionLogo from '../../../docs/logo.svg'
import SiderusLogo from '../../../docs/siderus-logo.svg'
import pjson from '../../../package.json'

const Window = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
`
const Orion = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`

const SiderusLink = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 10px 24px;

  display: flex;
  align-items: center;
  svg {
    margin-left: 5px;
  }
  &, svg, path, g {
    cursor: pointer;
  }
`

class AboutWindow extends React.Component {
  componentDidMount () {
    trackEvent('AboutWindowOpen')
  }

  render () {
    return (
      <Window>
        <Orion>
          <OrionLogo width='150px' />
          <h2>Siderus Orion</h2>
          <p>App version: {pjson.version}<br />IPFS version: {pjson.ipfsVersion} (go-ipfs)</p>
        </Orion>
        <SiderusLink onClick={event => shell.openExternal('https://siderus.io')}>
          Copyright © 2018 {pjson.author.name} <SiderusLogo width='30px' height='30px' />
        </SiderusLink>
      </Window>
    )
  }
}

ReactDom.render(<AboutWindow />, document.querySelector('#host'))
