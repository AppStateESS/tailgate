import React from 'react'
import Waiting from './Waiting.jsx'
import {YesButton, NoButton} from './Button.jsx'
import {Alcohol, Sober} from './Alcohol.jsx'

/* global $ */

class Spots extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      spots: []
    }
  }

  componentDidMount() {
    this.loadSpots()
  }

  componentWillReceiveProps() {
    this.loadSpots()
  }

  loadSpots() {
    if (this.props.lotId === 0) {
      return
    }

    $.getJSON('tailgate/Admin/Spot', {
      command: 'list',
      id: this.props.lotId
    }).done(function (data) {
      this.setState({spots: data})
    }.bind(this))
  }

  toggleReserve(key) {
    let allSpots = this.state.spots
    let spot = allSpots[key]
    // flops the value for the change
    let reserved = spot.reserved === '1'
      ? '0'
      : '1'

    $.post('tailgate/Admin/Spot', {
      command: 'reserve',
      id: spot.id,
      reserved: reserved
    }).done(function () {
      spot.reserved = reserved
      allSpots[key] = spot
      this.setState({spots: allSpots})
    }.bind(this)).fail(function () {
      //let error_message = 'Error: Could not update the spot'
    }.bind(this))
  }

  toggleSober(key) {
    let allSpots = this.state.spots
    let spot = allSpots[key]
    // flops the value for the change
    let sober = spot.sober === '1'
      ? '0'
      : '1'

    $.post('tailgate/Admin/Spot', {
      command: 'sober',
      id: spot.id,
      sober: sober
    }).done(function () {
      spot.sober = sober
      allSpots[key] = spot
      this.setState({spots: allSpots})
    }.bind(this)).fail(function () {
      //let error_message = 'Error: Could not update the spot'
    }.bind(this))
  }

  pickup(index) {
    let allSpots = this.state.spots
    let spot = allSpots[index]
    $.post('tailgate/Admin/Lottery/', {
      command: 'pickup',
      lotteryId: spot.lottery_id
    }, null, 'json').done(function () {
      spot.picked_up = '1'
      allSpots[index] = spot
      this.setState({spots: allSpots})
    }.bind(this))
  }

  render() {
    if (this.state.spots.length === 0) {
      return <Waiting/>
    }
    let pickedUp
    let lotteryInfo
    let timestamp = Math.floor(Date.now() / 1000)
    let showWinner = this.props.game !== null && this.props.game.signup_end < timestamp
    let showPickedupButtons = this.props.game !== null && this.props.game.pickup_deadline > timestamp
    let showPickedupStatus = this.props.game !== null && this.props.game.pickup_deadline < timestamp

    return (
      <div>
        <table className="table table-striped sans">
          <tbody>
            <tr>
              <th>
                Number
              </th>
              {showWinner
                ? <th className="col-sm-3">Lottery winner</th>
              : null}
              {showPickedupButtons || showPickedupStatus
                ? <th className="col-sm-1">Picked up</th>
              : null}
              <th >
                Reserved
              </th>
              <th>
                Sobriety
              </th>
            </tr>
            {this.state.spots.map(function (value, i) {
              pickedUp = null
              if (showWinner) {
                if (value.spot_id === null) {
                  lotteryInfo = <div className="text-muted">
                    <em>Not selected</em>
                  </div>
                } else {
                  if (showPickedupButtons) {
                    if (value.picked_up === '0') {
                      let pickupClick = this.pickup.bind(this, i)
                      pickedUp = <button
                          title="Click when student arrives to pick up tag"
                          className="btn btn-sm btn-danger"
                          onClick={pickupClick}>
                          <i className="fa fa-thumbs-down"></i>
                        </button>
                    } else {
                      pickedUp = <button className="btn btn-sm btn-success">
                        <i className="fa fa-thumbs-up"></i>
                      </button>
                    }
                  } else if (showPickedupStatus) {
                    if (value.picked_up === '0') {
                      pickedUp = <i className="fa fa-thumbs-o-down text-danger"></i>
                    } else {
                      pickedUp = <i className="fa fa-thumbs-o-up text-success"></i>
                    }
                  }
                  lotteryInfo = <div>
                    <strong>{value.first_name} {value.last_name}</strong>
                  </div>
                }
              }

              return (
                <tr key={i}>
                  <td className="text-center">{value.number}</td>
                  {showWinner
                    ? <td className="text-left">{lotteryInfo}</td>
                    : null}
                  {showPickedupButtons || showPickedupStatus
                    ? <td>{pickedUp}</td>
                    : null}
                  <td>{value.reserved === '1'
                      ? <YesButton handleClick={this.toggleReserve.bind(this, i)} label={'Reserved'}/>
                      : <NoButton
                        handleClick={this.toggleReserve.bind(this, i)}
                        label={'Not reserved'}/>}</td>
                  <td>{value.sober === '1'
                      ? <Sober toggle={this.toggleSober.bind(this, i)}/>
                      : <Alcohol toggle={this.toggleSober.bind(this, i)}/>}</td>
                </tr>
              )
            }.bind(this))}
          </tbody>
        </table>
        <div className="text-center">
          <button className="btn btn-sm btn-danger" onClick={this.props.close}>
            <i className="fa fa-times"></i>
            Close</button>
        </div>
      </div>
    )
  }
}

Spots.defaultProps = {
  lotId: 0
}

Spots.propTypes = {
  game: React.PropTypes.object,
  close: React.PropTypes.func,
  lotId: React.PropTypes.string
}

export default Spots
