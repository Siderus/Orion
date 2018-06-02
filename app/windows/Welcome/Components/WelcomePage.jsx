import React from 'react'
import OrionLogo from '../../../../docs/logo.svg'
import { Centered } from '../../../components/TextDiv'
import { shell } from 'electron'

import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button
} from 'react-photonkit'

const handleSubscribe = () => {
  shell.openExternal('http://eepurl.com/dfB6q5')
}

function WelcomePage ({ onNext }) {
  return (
    <Window>
      <Content>
        <Centered>
          <OrionLogo width='150px' height='150px' />
          <h1>Siderus Orion</h1>
          <h3>Welcome</h3>
          <p>Siderus Orion is the easiest way to start using the decentralised web with IPFS and Siderus Network. It supports a larger number of dApps as wel as the IPFS Browser Companion, to speed up your connection when surfing the decentralised web.</p>
          <p>This wizard will help you with the initial requirements.</p>
          <Button text="Subscribe to Siderus Newsletter" ptStyle="positive" ptSize="large" onClick={handleSubscribe} />
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

export default WelcomePage
