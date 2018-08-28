import React from 'react'
import Waiting from './Waiting.jsx'
import PropTypes from 'prop-types'

/* global $ */

class ConfirmSpot extends React.Component {
  constructor() {
    super()
    this.state = {availableSpots: [], message: null, waiting: 0, spotChoice: '0'}
    this.updateSpot = this.updateSpot.bind(this)
    this.confirmSpot = this.confirmSpot.bind(this)
  }

  componentDidMount () {
    this.loadAvailableSpots()
  }

  loadAvailableSpots () {
    $.getJSON('tailgate/User/Lottery', {command: 'spotChoice'}).done(function (data) {
      this.setState({availableSpots: data})
    }.bind(this))
  }

  confirmSpot () {
    var spotId = this.state.spotChoice
    if (spotId === '0') {
      return
    }
    var lotteryId = this.props.lottery.id
    this.setState({waiting: 1})
    $.post('tailgate/User/Lottery', {
      command: 'pickSpot',
      spotId: spotId,
      lotteryId: lotteryId
    }, null, 'json').done(function (data) {
      if (data.success) {
        this.props.loadData()
      } else {
        this.setState({waiting: 0})
        this.setState({
          message: <div className="alert alert-danger">Your requested spot was chosen by someone else. Pick again.</div>
        })
        this.loadAvailableSpots()
      }
    }.bind(this))
  }

  updateSpot(e) {
    this.setState({spotChoice : e.target.value})
  }

  render () {
    var sober
    if (this.state.waiting === 1) {
      return <Waiting/>
    }
    if (this.state.availableSpots.length > 0) {
      var options = this.state.availableSpots.map(function (val, i) {
        if (val.sober === '1') {
          sober = '(Non-alcoholic)'
        } else {
          sober = ''
        }
        return (
          <option key={i} value={val.id}>{val.lot_title + ', #' + val.number + ' ' + sober}</option>
        )
      })
      return (
        <div className="row">
          <div className="col-sm-12">
            <p>You have confirmed your winning ticket. Pick the spot you wish to tailgate in
              below. Choose quickly, other winners may be picking spots while you decide.</p>
            {this.state.message}
          </div>
          <div className="col-sm-4">
            <select className="form-control" onChange={this.updateSpot} defaultValue="0">
              <option disabled={true} value="0">- Choose below -</option>
              {options}
            </select>
          </div>
          <div className="col-sm-4">
            <button className="btn btn-primary" onClick={this.confirmSpot}>Confirm my tailgating spot</button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <p>We have run out of spots. Contact the site administrator.</p>
        </div>
      )
    }
  }
}

ConfirmSpot.propTypes = {
  lottery: PropTypes.object,
  loadData: PropTypes.func
}

export default ConfirmSpot
