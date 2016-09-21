import React from 'react'
import ReactDOM from 'react-dom'
import Game from './Game.jsx'
import Banned from './Banned.jsx'

/* global $ */

class Status extends React.Component {
  constructor() {
    super()
    this.state = {
      student: {},
      currentGame: {
        id: 0
      },
      lottery: null,
      spot: {}
    }

    this.loadData = this.loadData.bind(this)
  }

  loadData () {
    let student
    let currentGame
    let lottery
    let spot

    $.getJSON('tailgate/User/Student', {command: 'get'}).done(function (data) {
      student = data
      $.getJSON('tailgate/User/Game', {command: 'getCurrent'}).done(function (data) {
        currentGame = data
        if (currentGame) {
          // get the student's lottery submission for the current game
          $.getJSON('tailgate/User/Lottery', {
            command: 'get',
            game_id: data.id
          }).done(function (data) {
            lottery = data
            if (lottery) {
              $.getJSON('tailgate/User/Lottery', {
                command: 'getSpotInfo',
                lotteryId: lottery.id
              }).done(function (data) {
                if (data === false) {
                  spot = {}
                } else {
                  spot = data
                }
                this.setState({student: student, currentGame: currentGame, lottery: lottery, spot: spot})
              }.bind(this))
            } else {
              this.setState({student: student, currentGame: currentGame, lottery: lottery})
            }
          }.bind(this))
        } else {
          this.setState({currentGame: null, student: student})
        }
      }.bind(this))
    }.bind(this))
  }

  componentDidMount () {
    this.loadData()
  }

  render () {
    let content
    if (this.state.student.banned == 1) {
      return <Banned student={this.state.student}/>
    }
    if (this.state.currentGame === null) {
      content = <h4>No games scheduled. Try back later.</h4>
    } else {
      content = (<Game
        game={this.state.currentGame}
        lottery={this.state.lottery}
        spot={this.state.spot}
        loadData={this.loadData}/>)
    }
    return (
      <div>
        <h2>Welcome {this.state.student.first_name}&nbsp;
          {this.state.student.last_name}</h2>
        {content}
      </div>
    )
  }
}

ReactDOM.render(
  <Status/>, document.getElementById('student-status'))
