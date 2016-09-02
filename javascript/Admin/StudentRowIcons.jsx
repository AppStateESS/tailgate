import React from 'react'
import {Icon} from '../Mixin/Icon.jsx'

/* global $ */

class EligibleIcon extends React.Component {
  constructor(props) {
    super(props)
    this.hover = this.hover.bind(this)
  }

  hover(e) {
    if (this.props.value.eligible == '0') {
      $(e.target).tooltip('show')
    } else {
      $(e.target).tooltip('destroy')
    }
  }

  render() {
    let title = null
    let iconClass = null
    if (this.props.value.eligible == '1') {
      iconClass = 'fa-check text-success'
      title = 'Eligible'
    } else {
      iconClass = 'fa-times text-danger'
      title = 'Reason: ' + this.props.value.ineligible_reason
    }
    return (<Icon
      iconClass={iconClass}
      handleClick={this.props.handleClick}
      handleOver={this.hover}
      title={title}/>)
  }
}

EligibleIcon.propTypes = {
  value : React.PropTypes.object,
  handleClick: React.PropTypes.func
}

class BannedIcon extends React.Component {
  constructor(props) {
    super(props)
  }

  hover(e) {
    if (this.props.value.banned == '1') {
      $(e.target).tooltip('show')
    } else {
      $(e.target).tooltip('destroy')
    }
  }

  render() {
    let title = null
    let bannedDate = new Date(this.props.value.banned_date * 1000)
    let iconClass = null
    if (this.props.value.banned == '1') {
      iconClass = 'fa-times text-danger'
      title = 'Banned: ' + bannedDate.toLocaleDateString() + "\nReason: " + this.props.value.banned_reason
    } else {
      iconClass = 'fa-check text-success'
      title = 'Click to ban student'
    }
    return (<Icon
      iconClass={iconClass}
      handleClick={this.props.handleClick}
      handleOver={this.hover}
      title={title}/>)
  }
}

BannedIcon.propTypes = {
  value : React.PropTypes.object,
  handleClick: React.PropTypes.func
}

export {EligibleIcon, BannedIcon}
