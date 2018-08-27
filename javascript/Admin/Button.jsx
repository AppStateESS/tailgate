import React from 'react'
import PropTypes from 'prop-types'

class YesButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <button onClick={this.props.handleClick} className="btn btn-sm btn-success">
        <i className="fa fa-check"></i>&nbsp;
        {this.props.label}
      </button>
    )
  }
}

YesButton.propTypes = {
  handleClick : PropTypes.func,
  label: PropTypes.string
}


class NoButton extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <button onClick={this.props.handleClick} className="btn btn-sm btn-default">
        <i className="fa fa-times"></i>&nbsp;
        {this.props.label}
      </button>
    )
  }
}

NoButton.defaultProps = {}

NoButton.propTypes = {
  handleClick : PropTypes.func,
  label: PropTypes.string
}

export {YesButton, NoButton}
