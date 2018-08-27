import React from 'react'
import EditDateButton from './EditDateButton.jsx'
import DatetimeBox from './DatetimeBox.jsx'
import Datepicker from '../Mixin/datepicker'
import PropTypes from 'prop-types'

class DateSelect extends React.Component {
  constructor(props, dom, signupCommand) {
    super(props)
    this.Datepicker = new Datepicker(this.props.update, this.props.error, dom, signupCommand)
  }
}

DateSelect.propTypes = {
  update: PropTypes.func,
  error: PropTypes.func
}

class SignupStart extends DateSelect {
  constructor(props) {
    super(props, '#signup-start', 'updateSignupStart')
  }

  componentDidMount() {
    this.Datepicker.dateInit(true)
  }

  render() {
    let button = null
    let game = this.props.game
    let timestamp = this.props.timestamp
    let bgColor = game.signup_start > timestamp
      ? 'success'
      : 'info'
    if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
      button = <EditDateButton
        buttonId={'signup-start'}
        handleClick={this.Datepicker.popupCalendar}/>
    } else {
      button = null
    }

    return <DatetimeBox
      bgColor={bgColor}
      button={button}
      title={'Signup start'}
      date={this.props.game.signup_start_format}/>
  }
}

SignupStart.defaultProps = {
  allowEdit: true,
  game: null,
  timestamp: 0,
  error: null,
  update: null
}

class SignupEnd extends DateSelect {
  constructor(props) {
    super(props, '#signup-end', 'updateSignupEnd')
  }

  componentDidMount() {
    this.Datepicker.dateInit(true)
  }

  render() {
    let button = null
    let game = this.props.game
    let timestamp = this.props.timestamp
    let bgColor = timestamp < game.signup_end && timestamp > game.signup_start
      ? 'success'
      : 'info'
    if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
      button = <EditDateButton buttonId={'signup-end'} handleClick={this.popupCalendar}/>
    } else {
      button = null
    }

    return <DatetimeBox
      bgColor={bgColor}
      button={button}
      title={'Signup end'}
      date={this.props.game.signup_end_format}/>
  }
}

SignupEnd.defaultProps = {
  allowEdit: true,
  game: null,
  timestamp: 0,
  error: null,
  update: null
}

class PickupDeadline extends DateSelect {
  constructor(props) {
    super(props, '#pickup-deadline', 'updatePickupDeadline')
  }

  componentDidMount() {
    this.Datepicker.dateInit(true)
  }

  render() {
    let button = null
    let game = this.props.game
    let timestamp = this.props.timestamp
    let bgColor = timestamp < game.pickup_deadline && timestamp > game.signup_end
      ? 'success'
      : 'info'
    if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
      button = <EditDateButton buttonId={'pickup-deadline'} handleClick={this.popupCalendar}/>
    } else {
      button = null
    }

    return <DatetimeBox
      bgColor={bgColor}
      button={button}
      title={'Pickup Deadline'}
      date={this.props.game.pickup_deadline_format}/>
  }
}

PickupDeadline.defaultProps = {
  allowEdit: true,
  game: null,
  timestamp: 0,
  error: null,
  update: null
}

class Kickoff extends DateSelect {
  constructor(props) {
    super(props, '#kickoff', 'updateKickoff')
  }

  componentDidMount() {
    this.Datepicker.dateInit(false)
  }

  render() {
    let button = null
    let game = this.props.game
    let timestamp = this.props.timestamp
    let bgColor = timestamp < game.kickoff && timestamp > game.pickup_deadline
      ? 'success'
      : 'info'
    if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
      button = <EditDateButton buttonId={'kickoff'} handleClick={this.popupCalendar}/>
    } else {
      button = null
    }

    return <DatetimeBox
      bgColor={bgColor}
      button={button}
      title={'Kickoff'}
      date={this.props.game.kickoff_format}/>
  }
}

Kickoff.defaultProps = {
  allowEdit: true,
  game: null,
  timestamp: 0,
  error: null,
  update: null
}

export {SignupStart, SignupEnd, PickupDeadline, Kickoff}
