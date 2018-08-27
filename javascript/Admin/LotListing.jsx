import React from 'react'
import Spots from './Spots.jsx'
import PropTypes from 'prop-types'

/* global $ */

class LotListing extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      spotKey: -1
    }
    this.resetSpots = this.resetSpots.bind(this)
  }

  resetSpots() {
    this.setState({spotKey: -1})
  }

  manageSpots(key) {
    if (this.state.spotKey === key) {
      key = -1
    }
    this.setState({spotKey: key})
  }

  deactivate(key) {
    $.post('tailgate/Admin/Lot', {
      command: 'deactivate',
      lotId: this.props.lots[key].id
    }).done(function () {
      this.props.loadLots()
    }.bind(this))
  }

  activate(key) {
    $.post('tailgate/Admin/Lot', {
      command: 'activate',
      lotId: this.props.lots[key].id
    }).done(function () {
      this.props.loadLots()
    }.bind(this))
  }

  delete(key) {
    if (prompt('Type Y-E-S if you are sure you want to permanently delete this lot') === 'YES') {
      $.post('tailgate/Admin/Lot', {
        command: 'delete',
        lotId: this.props.lots[key].id
      }).done(function () {
        this.props.loadLots()
      }.bind(this))
    }
  }

  render() {
    let timestamp = Math.floor(Date.now() / 1000)
    let button = null
    let allowExtraButtons = false
    if (this.props.game === null || this.props.game.signup_start > timestamp) {
      allowExtraButtons = true
    } else {
      allowExtraButtons = false
    }
    const spacing = {
      marginLeft: '.5em'
    }
    return (
      <div>
        {this.props.lots.map(function (value, i) {
          if (allowExtraButtons) {
            if (value.active === '1') {
              button = <button
                style={spacing}
                className="btn btn-danger btn-sm"
                onClick={this.deactivate.bind(this, i)}>Deactivate</button>
            } else {
              button = <span>
                <button
                  style={spacing}
                  className="btn btn-success btn-sm"
                  onClick={this.activate.bind(this, i)}>Activate</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={this.delete.bind(this, i)}
                  style={spacing}>
                  <i className="far fa-trash-alt"></i>&nbsp; Delete</button>
              </span>
            }
          }
          return (
            <div className="panel panel-default" key={i}>
              <div className="panel-body row">
                <div className="col-sm-6"><h4>{value.title}</h4>
                  <p><strong>Total spots:</strong>
                  {value.total_spots}, <strong>Reserved:</strong> {value.reserved ? value.reserved : 0}</p>
                  </div>
                <div className="col-sm-6">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={this.manageSpots.bind(this, i)}>
                    Manage Spots&nbsp;
                    <i
                      className={this.state.spotKey === i
                      ? 'fa fa-caret-up'
                      : 'fa fa-caret-down'}></i>
                  </button>
                  {button}
                </div>
                {this.state.spotKey === i
                  ? <Spots lotId={value.id} close={this.resetSpots} game={this.props.game} reload={this.props.loadLots}/>
                  : null}
              </div>
            </div>
          )
        }.bind(this))}
      </div>
    )
  }
}

LotListing.defaultProps = {
  lots: []
}
LotListing.propTypes = {
  game: PropTypes.object,
  lots: PropTypes.array,
  loadLots: PropTypes.func
}

export default LotListing
