import React from "react"
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Footer extends React.Component {

  render() {
    let props = Object.assign({}, this.props);
    let importButton = null

    if(props.statsStore.hash.length >= 3)
      importButton = <Button text="Import" ptStyle="primary" pullRight />

    return (
      <Toolbar ptType="footer">
        <Actionbar>
          <Button text="Close" ptStyle="default" onClick={window.close} />
          {importButton}
        </Actionbar>
      </Toolbar>
    )
  }
}

export default Footer