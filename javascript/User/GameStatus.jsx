import React from 'react'
import LotterySubmit from './LotterySubmit.jsx'
import ConfirmSpot from './ConfirmSpot.jsx'

/* global $ */

class GameStatus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null
    }
    this.submitLottery = this.submitLottery.bind(this)
  }

  submitLottery() {
    $.post('tailgate/User/Lottery', {
      command: 'apply',
      game_id: this.props.game.id
    }).done(function () {
      this.props.loadData()
    }.bind(this)).fail(function () {
      this.setState({
        error: <p>A problem occurred when trying to save your information.
            <a href="./tailgate">Please try again.</a>
            If the error continues please contact us.</p>
      })
    }.bind(this))
  }

  render() {
    var content = null
    var timestamp = Math.floor(Date.now() / 1000)
    if (this.state.error !== null) {
      return <div className="alert alert-danger">{this.state.error}</div>
    }

    if (this.props.game.id === undefined) {
      content = <div className="alert alert-info">The next lottery has not been created yet. Check back later.</div>
    } else if (this.props.game.id === 0) {
      content = null
    } else {
      if (this.props.game.lottery_run === '1') {
        // lottery has been run
        if (this.props.lottery) {
          // check if student submitted a lottery
          if (this.props.lottery.winner === '1') {
            // see if current student is a winner
            if (this.props.lottery.confirmed === '1') {
              // current student has confirmed their spot via email
              if (this.props.lottery.spot_id !== '0') {
                if (this.props.lottery.picked_up === '1') {
                  content = <div className="alert alert-info">Your tailgate tag has been picked up. Enjoy the game!</div>
                } else if (this.props.game.pickup_deadline < timestamp) {
                  content = <div className="alert alert-info">Sorry, you failed to pick up your tailgating
                    pass in time. It has been forfeited.</div>
                } else {
                  content = <div className="alert alert-info">You have chosen the&nbsp;
                    <strong>{this.props.spot.title}</strong>&nbsp;lot , spot number&nbsp;
                    <strong>{this.props.spot.number}</strong>.<br/>
                    Make sure to pick up your tag before the&nbsp;{this.props.game.pickup_deadline_format}&nbsp; deadline.<br/>See the&nbsp;
                    <a href="./">home page</a>&nbsp; for more details.</div>
                }
              } else {
                if (this.props.game.pickup_deadline < timestamp) {
                  content = <div className="alert alert-info">Sorry, you failed to confirm your tailgating win. Your spot has been forfeited.</div>
                } else {
                  content = <div><ConfirmSpot lottery={this.props.lottery} loadData={this.props.loadData}/></div>
                }
              }
            } else {
              // current student has not confirmed their spot
              content = <div className="alert alert-success">
                <strong>Congratulations,</strong>
                you won a lottery spot! Check your email to confirm your win.</div>
            }
          } else {
            // student submitted but did not win
            content = <div className="alert alert-info">Sorry, you did not win a spot this time. Try again next game.</div>
          }
        } else {
          // student did not submit a ticket for current lottery
          content = <div className="alert alert-danger">The lottery is complete and the winners have
            been contacted. Please, try again next game.</div>
        }
      } else {
        // lottery has not been run yet
        if (timestamp >= this.props.game.signup_end) {
          // signup time is over
          if (this.props.lottery) {
            // the student submitted a ticket
            content = <div className="alert alert-info">Your application has been submitted. Watch
              your email and check back later for lottery results.</div>
          } else {
            // the student didn't submit a ticket.
            content = <div className="alert alert-info">Sorry, you missed the lottery sign up deadline. Try again next game.</div>
          }
        } else if (this.props.game.signup_start <= timestamp) {
          // the sign up start has passed.
          if (this.props.lottery) {
            // the student submitted a ticket.
            content = <div className="alert alert-info">Your application has been submitted. Check your email after {this.props.game.signup_end_format}&nbsp; for lottery results.</div>
          } else {
            // the student hasn't submitted a ticket, show them the form
            content = <LotterySubmit game={this.props.game} handleClick={this.submitLottery}/>
          }
        } else {
          // the lottery signup has not yet begun
          content = <div className="alert alert-success">Tailgate lottery for this game begins at
            <strong>{this.props.game.signup_start_format}</strong>. See you then!</div>
        }
      }
    }
    return content
  }
}

GameStatus.propTypes = {
  game: PropTypes.object,
  lottery: PropTypes.object,
  spot: PropTypes.object,
  loadData: PropTypes.func
}

export default GameStatus
