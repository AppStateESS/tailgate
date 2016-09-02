import React from 'react'

class Sober extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <button className="btn btn-default btn-sm" onClick={this.props.toggle}>
        <i className="fa fa-ban"></i>
        Sober only</button>
    )
  }
}

Sober.defaultProps = {}
Sober.propTypes = {
  toggle : React.PropTypes.func
}

class Alcohol extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <button className="btn btn-default btn-sm" onClick={this.props.toggle}>
        <span className="text-success">
          <i className="fa fa-beer"></i>
          Alcohol allowed</span>
      </button>
    )
  }
}

Alcohol.defaultProps = {}
Alcohol.propTypes = {
  toggle : React.PropTypes.func
}

export {Sober, Alcohol}
