import React from 'react'
import { Centered, LeftAligned } from '../../../components/TextDiv'

import SiderusLogo from '../../../../docs/siderus-logo.svg'

import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button,
} from 'react-photonkit'

class ServicesPage extends React.Component {
  render () {
    const { onNext } = this.props
    return (
      <Window>
        <Content>
          <Centered>
            <SiderusLogo width='150px' height='150px'/>
            <h1>Siderus Services</h1>
            <h3>Enable a better experience</h3>
            <LeftAligned>

              Siderus offers a set of services designed to ease and improve the
              user experience of IPFS. Orion will always connect to Siderus IPFS
              Nodes and you can enable the services to gain some benefits,
              including, but not limiting to:
                <ul>
                  <li>Pre-fetching of the content on public Gateways</li>
                  <li>Siderus Mercury, ACL and Encryption</li>
                  <li>Siderus Hera, remote syncronization</li>
                  <li>Siderus Hera, remote pinning</li>
                </ul>
            </LeftAligned>
            <Button text="Enable Siderus Services" ptStyle="positive" ptSize="large"/>
          </Centered>
        </Content>
        <Toolbar ptType="footer">
          <Actionbar>
            <Button text="Next" ptStyle="primary" onClick={onNext} pullRight />
          </Actionbar>
        </Toolbar>
      </Window>
    )
  }
}

export default ServicesPage
