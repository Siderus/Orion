import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {

  render() {
    return (
      <Toolbar ptType="footer">
        <Actionbar>
          <Button text="Close" ptStyle="default" onClick={window.close} />

          <Button text="Import" ptStyle="primary" pullRight />
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Footer