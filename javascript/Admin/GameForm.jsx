import React from 'react'
import TextInput from '../Mixin/TextInput.jsx'

/* global $ */

class GameForm extends React.Component {
  componentDidMount() {
    $('#signup-start').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})
    $('#signup-end').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})
    $('#pickup-deadline').datetimepicker({timepicker: true, format: 'n/j/Y H:i'})
    $('#kickoff').datetimepicker({timepicker: false, format: 'n/j/Y'})
  }

  render() {
    let date = new Date()
    let month = (date.getMonth() + 1)
    let dateString = month + '/' + date.getDate() + '/' + date.getFullYear()
    let hours = date.getHours().toString()
    let datetimeString = dateString + ' ' + hours + ':00'
    let options = this.props.visitors.map(function (value, i) {
      return (
        <option key={i} value={value.id}>
          {value.university}
          - {value.mascot}
        </option>
      )
    }.bind(this))
    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <label htmlFor="pick-team">
              Pick visiting team
            </label>
            <select id="pick-team" className="form-control">
              {options}
            </select>
          </div>
          <div className="col-sm-6">
            <TextInput
              inputId="kickoff"
              label="Game date"
              ref="date"
              defaultValue={dateString}/>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            <TextInput
              inputId="signup-start"
              label="Signup start"
              ref="date"
              defaultValue={datetimeString}/>
          </div>
          <div className="col-sm-4">
            <TextInput
              inputId="signup-end"
              label="Signup deadline"
              ref="date"
              defaultValue={datetimeString}/>
          </div>
          <div className="col-sm-4">
            <TextInput
              inputId="pickup-deadline"
              label="Pickup deadline"
              ref="date"
              defaultValue={datetimeString}/>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 text-center">
            <button className="btn btn-success" onClick={this.props.save}>
              <i className="fa fa-save"></i>
              Save game
            </button>
          </div>
        </div>
      </div>
    )
  }
}

GameForm.propTypes = {
  visitors: React.PropTypes.array
}
export default GameForm
