import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"

class Header extends React.Component {
  render() {
    return (
      <Toolbar title="Storage">
        <Actionbar>
          <ButtonGroup>
            <Button glyph="plus-circled" />
            <Button glyph="minus-circled" />
            <Button glyph="download" />
          </ButtonGroup>

          <Button glyph="cog" pullRight/>
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Header