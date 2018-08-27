import React from 'react'
import PropTypes from 'prop-types'

class Sober extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <button className="btn btn-default btn-sm" onClick={this.props.toggle}>
        <i className="fa fa-ban"></i>&nbsp;
        Sober only</button>
    )
  }
}

Sober.defaultProps = {}
Sober.propTypes = {
  toggle : PropTypes.func
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
          <i className="fa fa-beer"></i>&nbsp;
          Alcohol allowed</span>
      </button>
    )
  }
}

Alcohol.defaultProps = {}
Alcohol.propTypes = {
  toggle : PropTypes.func
}

export {Sober, Alcohol}
