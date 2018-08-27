import React from 'react'
import PropTypes from 'prop-types'

class Icon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let style = null
    if (typeof this.props.handleClick === 'function') {
      style = {
        cursor: 'pointer'
      }
    }
    return (
      <i
        style={style}
        className={'fa fa-check fa-lg ' + this.props.iconClass}
        onClick={this.props.handleClick}
        onMouseOver={this.props.handleOver}
        title={this.props.title}></i>
    )
  }
}

Icon.defaultProps = {}
Icon.propTypes = {
  handleOver : PropTypes.func,
  handleClick: PropTypes.func,
  iconClass: PropTypes.string,
  title: PropTypes.string
}

class YesIcon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (<Icon iconClass={'fa-check text-success'}/>)
  }
}

class NoIcon extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (<Icon iconClass={'fa-times text-danger'}/>)
  }
}

export {Icon, YesIcon, NoIcon}
