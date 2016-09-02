import React from 'react'

class Waiting extends React.Component {
  render() {
    return (
      <div className="text-center">
        <i className="fa fa-cog fa-spin"></i>
        Loading...</div>
    )
  }
}

Waiting.defaultProps = {}

export default Waiting
