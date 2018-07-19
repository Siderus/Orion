import React from 'react'
import styled from 'styled-components'
import { shell } from 'electron'
import Settings from 'electron-settings'

import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button
} from 'react-photonkit'

const StyledContent = styled.div`
  h1:first-child {
    margin-top: 0px;
  }
`

const PrivacyLink = <a onClick={() => shell.openExternal('https://siderus.io/privacy')} href='#'>Privacy policy</a>

class StatsPage extends React.Component {
  enableStats = () => {
    Settings.set('allowUserTracking', true)
    this.props.onNext()
  }

  disableStats = () => {
    Settings.set('allowUserTracking', false)
    this.props.onNext()
  }

  render () {
    return (
      <Window>
        <Content>
          <StyledContent>
            <h1>Support Orion development</h1>
            <p>
              Siderus Orion is integrated with Mixpanel and Sentry to help us
              debugging errors, understanding how to improve the
              application and your <b>user experience with IPFS</b>. <br />
              <br />
              Both the integrations are using anonymized information, and
              focusing on only the important details. Some of them are:
              <ul>
                <li>An unique random ID generated on the first usage</li>
                <li>Features used (Windows, Screens and Sessions)</li>
                <li>Operative System and release/version</li>
                <li>Amount of files shared and the size, NOT the hashes/content</li>
              </ul>
              You can opt-in as well as opt out at any time from the Settings.<br />
              <br />
              By enabling this feature, you will provide extra valuable metrics
              and data useful for improving your user experience, the
              services and fixing bugs <b>on top of the default Sentry anonymous
              errors reporting</b> always enabled.<br />
              <br />
              You can validate these information by reading and checking the
              source code on GitHub. You can also read Siderus {PrivacyLink}.
            </p>
          </StyledContent>
        </Content>
        <Toolbar ptType="footer">
          <Actionbar>
            <Button text="Enable Tracking" ptStyle="primary" onClick={this.enableStats} pullRight />
            <Button text="Disable" onClick={this.disableStats} pullRight />
          </Actionbar>
        </Toolbar>
      </Window>
    )
  }
}

export default StatsPage
