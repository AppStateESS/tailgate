import React from 'react'
import LotteryRun from './LotteryRun.jsx'
import {SignupStart, SignupEnd, PickupDeadline, Kickoff} from './DateSelect.jsx'

class GameInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: null,
      allowEdit: true
    }
    this.update = this.update.bind(this);
    this.setError = this.setError.bind(this);
  }

  componentDidMount() {
    this.initializeDateTime()
  }

  initializeDateTime() {
    let game = this.props.game
    if (game.lottery_run == '0' || this.state.allowEdit) {
      $('#signup-start').datetimepicker({
        value: game.signup_start_ts,
        maxDate: game.signup_end_ts.substr(0, 10)
      })

      $('#signup-end').datetimepicker({
        value: game.signup_end_ts,
        minDate: game.signup_start_ts.substr(0, 10),
        maxDate: game.pickup_deadline_ts.substr(0, 10)
      })

      $('#pickup-deadline').datetimepicker({
        value: game.pickup_deadline_ts,
        minDate: game.signup_end_ts.substr(0, 10),
        maxDate: game.kickoff_ts
      })

      $('#kickoff').datetimepicker({
        value: game.kickoff_ts,
        minDate: game.pickup_deadline_ts.substr(0, 10)
      })
    }
  }

  setError(error) {
    this.setState({message: (
        <div className='alert alert-danger'>
          {error}
        </div>
      )})
  }

  update() {
    this.setState({message: null})
    let xhr = this.props.loadGame()
    xhr.always(function () {
      this.initializeDateTime()
    }.bind(this))
  }

  render() {
    let button = null
    let message = null
    let timestamp = Math.floor(Date.now() / 1000)
    let pickupReport = null
    let winnerReport = null
    let spotReport = null

    if (this.props.game.lottery_run === '1' && this.props.game.pickup_deadline < timestamp) {
      pickupReport = (
        <div className='pull-left' style={{
          marginRight: '.5em'
        }}>
          <a
            href='./tailgate/Admin/Report/?command=pickup'
            target='_blank'
            className='btn btn-primary btn-sm'>
            <i className='fa fa-file-text-o'></i>
            Pickup report</a>
        </div>
      )

      spotReport = (
        <div>
          <a
            href='./tailgate/Admin/Report/?command=spotReport'
            target='_blank'
            className='btn btn-primary btn-sm'>
            <i className='fa fa-file-text-o'></i>
            Spot report</a>
        </div>
      )
    }

    if (this.props.game.lottery_run === '1') {
      winnerReport = (
        <div className='pull-left' style={{
          marginRight: '.5em'
        }}>
          <a
            href='./tailgate/Admin/Report/?command=winners'
            target='_blank'
            className='btn btn-primary btn-sm'>
            <i className='fa fa-file-text-o'></i>
            Winner list</a>
        </div>
      )
    }

    if (this.props.game.lottery_run == '0') {
      button = <LotteryRun game={this.props.game} startLottery={this.props.startLottery}/>
    } else if (this.props.game.kickoff < Math.floor(Date.now() / 1000)) {
      button = <button className='btn btn-primary' onClick={this.props.completeGame}>
        Complete lottery
      </button>
    }

    return (
      <div>
        <h4>{this.props.game.university} {this.props.game.mascot}
          - Total submissions: {this.props.submissions}, Unreserved, available spots: {this.props.availableSpots}</h4>
        {this.state.message}
        <div className='row'>
          <SignupStart
            allowEdit={this.state.allowEdit}
            timestamp={timestamp}
            error={this.setError}
            update={this.update}
            game={this.props.game}/>
          <SignupEnd
            allowEdit={this.state.allowEdit}
            timestamp={timestamp}
            error={this.setError}
            update={this.update}
            game={this.props.game}/>
          <PickupDeadline
            allowEdit={this.state.allowEdit}
            timestamp={timestamp}
            error={this.setError}
            update={this.update}
            game={this.props.game}/>
          <Kickoff
            allowEdit={this.state.allowEdit}
            timestamp={timestamp}
            error={this.setError}
            update={this.update}
            game={this.props.game}/>
        </div>
        {winnerReport}
        {pickupReport}
        {spotReport}
        <div style={{
          marginTop: '.5em',
          clear: 'both'
        }}>
          {button}
        </div>
      </div>
    )
  }
}

GameInfo.defaultProps = {
  game: null,
  startLottery: null, // function to start the lottery
  submissions: 0,
  loadGame: null, // function to reload the game Object
  availableSpots: 0
}

export default GameInfo
