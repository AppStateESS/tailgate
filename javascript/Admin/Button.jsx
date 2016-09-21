import React from 'react'

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
  handleClick : React.PropTypes.func,
  label: React.PropTypes.string
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
  handleClick : React.PropTypes.func,
  label: React.PropTypes.string
}

export {YesButton, NoButton}
