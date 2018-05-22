import React from 'react'
import styled from 'styled-components'
import ToS from './ToS'
import { shell } from 'electron'
import Settings from 'electron-settings'

import {
  Window,
  Content,
  Toolbar,
  Actionbar,
  Button,
  CheckBox
} from 'react-photonkit'

const StyledContent = styled.div`
  h1:first-child {
    margin-top: 0px;
  }
`

const TermsSection = styled.section`
  background: white;
  height: calc(100vh - 270px);
  overflow: auto;
  padding: 0px 10px;
`

const ToSLink = <a onClick={() => shell.openExternal('https://siderus.io/tos.html')} href='#'>Siderus Terms of Service</a>
const PrivacyLink = <a onClick={() => shell.openExternal('https://siderus.io/privacy')} href='#'>Privacy policy</a>
const checkboxLabel = <span>I have read and I agree to {ToSLink} and {PrivacyLink}</span>

class TermsOfServicePage extends React.Component {
  state = {
    tosChecked: false,
    skipUserTracking: false
  }

  handleToSChange = () => {
    const nextValue = !this.state.tosChecked
    this.setState({ tosChecked: nextValue })
  }

  handleUserTrackingChange = () => {
    const nextValue = !this.state.skipUserTracking
    Settings.setSync('skipUserTracking', nextValue)
    this.setState({ skipUserTracking: nextValue })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    if (!this.state.tosChecked) return

    this.props.onAccept()
  }

  render () {
    const { onQuit } = this.props
    const { tosChecked, skipUserTracking } = this.state

    return (
      <form onSubmit={this.handleSubmit}>
        <Window>
          <Content>
            <StyledContent>
              <h1>Terms of Service</h1>
              <p>In order to continue, you need to accept the Terms of Service:</p>
              <TermsSection>
                <ToS />
              </TermsSection>
              <CheckBox
                label={checkboxLabel}
                checked={tosChecked}
                onChange={this.handleToSChange}
              />
              <CheckBox
                label='Send anonymized statistics to help improve this app'
                checked={!skipUserTracking}
                onChange={this.handleUserTrackingChange}
              />
            </StyledContent>
          </Content>
          <Toolbar ptType="footer">
            <Actionbar>
              <Button text="Quit" ptStyle="default" onClick={onQuit} />
              {
                tosChecked &&
                <Button
                  text="Done"
                  ptStyle="primary"
                  type="submit"
                  pullRight
                />
              }
            </Actionbar>
          </Toolbar>
        </Window>
      </form>
    )
  }
}

export default TermsOfServicePage
