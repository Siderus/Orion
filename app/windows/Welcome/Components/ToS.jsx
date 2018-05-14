import React from 'react'
import request from 'request-promise-native'
import Spinner from 'react-spin'

class ToS extends React.Component {
  state = {}

  constructor () {
    super()
    this.fetchContent()
  }

  fetchContent = () => {
    request({ uri: 'https://siderus.io/tos.html' })
      .then(res => this.setState({ tos: res }))
      .catch(err => {
        console.error(err)
        throw err
      })
  }

  render () {
    return (
      this.state.tos
        ? <div dangerouslySetInnerHTML={{ __html: this.state.tos }} />
        : <Spinner />
    )
  }
}

export default ToS
