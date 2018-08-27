import React from 'react'
import PropTypes from 'prop-types'

/**
 * this script shows the option to run the lottery
 * See RunLottery for the processing
 */

class LotteryRun extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      start: false
    }
    this.confirmLottery = this.confirmLottery.bind(this)
    this.stopLottery = this.stopLottery.bind(this)
  }

  confirmLottery() {
    this.setState({start: true})
  }

  stopLottery() {
    this.setState({start: false})
  }

  render() {
    let button = null
    let ctime = Date.now() / 1000
    let currentTime = Math.floor(ctime)
    const marginRight = {
      'marginRight': '1em'
    }
    if (this.props.game.lottery_started === '1') {
      button = <button className="btn btn-success" disabled={true}>Lottery in progress...</button>
    } else if (this.props.game.signup_end < currentTime) {
      if (this.state.start) {
        button = (
          <div>
            <p>Are you sure you want to start the lottery?</p>
            <button
              style={marginRight}
              className="btn btn-success btn-lg"
              onClick={this.props.startLottery}>
              <i className="fa fa-check"></i>&nbsp; Confirm: Start lottery</button>
            <button className="btn btn-danger btn-lg" onClick={this.stopLottery}>
              <i className="fa fa-times"></i>&nbsp; Cancel running lottery</button>
          </div>
        )
      } else {
        button = <button className="btn btn-success btn-lg" onClick={this.confirmLottery}>Start lottery</button>
      }
    }
    return (
      <div className="text-center">{button}</div>
    )
  }
}

LotteryRun.propTypes = {
  startLottery: PropTypes.func,
  game: PropTypes.object
}

export default LotteryRun
