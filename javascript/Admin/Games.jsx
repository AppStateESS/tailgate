import React from 'react'
import GameInfo from './GameInfo.jsx'
import GameForm from './GameForm.jsx'

/* global $ */

class Games extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      visitors: [],
      availableSpots: 0,
      submissions: 0,
      message: ''
    }
  }

  showForm () {
    this.setState({showForm: true})
  }

  hideForm () {
    this.setState({showForm: false})
  }

  loadVisitors () {
    $.getJSON('tailgate/Admin/Visitor', {command: 'list'}).done(function (data) {
      if (data.length < 1) {
        data = []
      }
      this.setState({visitors: data})
    }.bind(this))
  }

  getUnixTime (date) {
    var obj = new Date(date).getTime() / 1000
    return obj
  }

  loadGames () {
    this.props.loadGame()
    $.getJSON('tailgate/Admin/Game', {command: 'list'}).done(function (data) {
      this.setState({availableSpots: data.available_spots})
    }.bind(this))
  }

  completeGame () {
    $.post('tailgate/Admin/Game', {
      command: 'complete',
      id: this.props.game.id
    }, null, 'json').done(function (data) {
      this.loadGames()
    }.bind(this))
  }

  loadSubmissions () {
    $.getJSON('tailgate/Admin/Lottery', {command: 'submissionCount'}).done(function (data) {
      this.setState({submissions: data.submissions})
    }.bind(this))
  }

  componentDidMount () {
    this.loadVisitors()
    this.loadGames()
    this.loadSubmissions()
    $('#signup-start').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})

    $('#signup-end').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})

    $('#pickup-deadline').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})

    $('#kickoff').datetimepicker({timepicker: false, format: 'n/j/Y'})
  }

  saveGame () {
    let visitorId = $('#pick-team').val()
    let kickoff = this.getUnixTime($('#kickoff').val())
    let startSignup = new Date($('#signup-start').val()).getTime() / 1000
    let endSignup = new Date($('#signup-end').val()).getTime() / 1000
    let pickupDeadline = new Date($('#pickup-deadline').val()).getTime() / 1000

    if (startSignup < endSignup) {
      if (endSignup < pickupDeadline) {
        if (pickupDeadline < kickoff) {
          $.post('tailgate/Admin/Game', {
            command: 'add',
            visitor_id: visitorId,
            kickoff: kickoff,
            signup_start: startSignup,
            signup_end: endSignup,
            pickup_deadline: pickupDeadline
          }).done(function () {
            this.loadGames()
            this.props.loadLots()
            this.setState({message: ''})
          }.bind(this))
        } else {
          this.setState({message: 'Pickup date must be less than game date'})
        }
      } else {
        this.setState({message: 'Signup deadline must be less than pickup date'})
      }
    } else {
      this.setState({message: 'Signup start must be less than signup deadline'})
    }
  }

  render () {
    let currentGame = null
    let message = null
    let title = 'Current game'

    if (this.state.message.length > 0) {
      message = (
        <div className='alert alert-danger'>
          {this.state.message}
        </div>
      )
    }

    if (this.props.game === null) {
      title = 'Add new game'
      if (this.state.visitors.length === 0) {
        currentGame = (
          <div>
            <p>
              Create some visitors first.
            </p>
          </div>
        )
      } else if (this.props.lots.length === 0) {
        currentGame = (
          <div>
            <p>
              Create some tailgate lots first.
            </p>
          </div>
        )
      } else {
        currentGame = <GameForm visitors={this.state.visitors} save={this.saveGame} />
      }
    } else if (Object.keys(this.props.game).length > 0) {
      currentGame = (
        <GameInfo
          game={this.props.game}
          startLottery={this.props.startLottery}
          submissions={this.state.submissions}
          loadGame={this.props.loadGame}
          completeGame={this.completeGame}
          availableSpots={this.state.availableSpots} />
      )
    } else {
      currentGame = null
    }

    return (
      <div>
        <div className='well'>
          <div className='row'>
            <div className='col-sm-12'>
              <h3>{title}</h3>
              {message}
            </div>
          </div>
          {currentGame}
        </div>
      </div>
    )
  }
}

Games.defaultProps = {
  loadGame: null,
  loadLots: null,
  startLottery: null,
  game: {},
  lots: []
}

Games.propTypes = {
  loadGame: React.PropTypes.func,
  loadLots: React.PropTypes.func,
  startLottery: React.PropTypes.func,
  game: React.PropTypes.object,
  lots: React.PropTypes.array
}

export default Games
