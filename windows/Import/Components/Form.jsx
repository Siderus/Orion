import React from "react"
import { Input } from "react-photonkit"
import { observer } from "mobx-react"

@observer
class Form extends React.Component {

  render() {
    return (
      <form>
        <div className="form-group">
          <label>Object/File Hash</label>
          <Input type="text" placeholder="Qm1A2B3C4D...." />
        </div>
      </form>

    )
  }
}

export default Form