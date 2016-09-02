import React from 'react'
import TextInput from '../Mixin/TextInput.jsx'
import StudentRow from './StudentRow.jsx'

/* global $ */

class Students extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      students: [],
      limit: 50,
      search: null,
      availableSpots: [],
      message: null
    }
    this.setMessage = this.setMessage.bind(this)
    this.reset = this.reset.bind(this)
  }
  componentDidMount() {
    this.loadStudents(this.state.limit)
    this.loadAvailableSpots()
  }

  loadAvailableSpots() {
    $.getJSON('tailgate/Admin/Lottery', {command: 'getUnclaimedSpots'}).done(function (data) {
      this.setState({availableSpots: data})
    }.bind(this))
  }

  searchRows(e) {
    let search_phrase = e.target.value
    let search_length = search_phrase.length

    window.setTimeout(function () {
      if (search_length > 2) {
        this.loadStudents(this.state.limit, search_phrase)
      } else if (search_length === 0) {
        this.loadStudents(this.state.limit, '')
      }
    }.bind(this), 600)
  }

  loadStudents(limit, search) {
    if (limit === undefined) {
      limit = this.state.limit
    }
    if (search === undefined) {
      search = this.state.search
    }

    if (search !== this.state.search) {
      limit = 50
    }
    $.getJSON('tailgate/Admin/Student/', {
      command: 'list',
      limit: limit,
      search: search
    }).done(function (data) {
      this.setState({students: data, limit: limit, search: search})
    }.bind(this))
  }

  reset() {
    this.loadStudents(this.state.limit)
    this.loadAvailableSpots()
  }

  preventSpaces(e) {
    if (e.charCode == '32') {
      e.preventDefault()
    }
  }

  setMessage(message) {
    this.setState({message: message})
  }

  render() {
    let timestamp = Math.floor(Date.now() / 1000)
    let availableCount = 0
    let availableSentence = null
    let showAvailableCount = 0
    if (this.props.game) {
      showAvailableCount = this.props.game.pickup_deadline < timestamp
      if (showAvailableCount) {
        availableCount = this.state.availableSpots.length
        if (availableCount > 1) {
          availableSentence = (
            <div className="alert alert-warning">There are&nbsp;{availableCount}&nbsp; unclaimed spots left.</div>
          )
        } else if (availableCount === 1) {
          availableSentence = (
            <div className="alert-danger alert">There is just
              <strong>one</strong>
              more unclaimed spot left.</div>
          )
        } else {
          availableSentence = <div className="alert alert-success">
            All spots have been claimed.
          </div>
        }
      }
    }
    let nextLimit = this.state.limit + 50
    let nextButton = null
    if (this.state.limit <= this.state.students.length) {
      nextButton = <button
        className="btn btn-default"
        onClick={this.loadStudents.bind(null, nextLimit, this.state.search)}>
        <i className="fa fa-plus"></i>
        Show more rows
      </button>
    }
    return (
      <div>
        {this.state.message
          ? <div className="alert alert-danger">{this.state.message}</div>
          : null
}
        <div className="row">
          <div className="col-sm-4">
            <TextInput
              placeholder={'Search'}
              handleChange={this.searchRows}
              handlePress={this.preventSpaces}/>
          </div>
          <div className="col-sm-8">
            {showAvailableCount
              ? availableSentence
              : null}
          </div>
        </div>
        <table className="table table-striped sans">
          <thead>
            <tr>
              <th>Id</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Username</th>
              <th>Wins</th>
              <th className="text-center">Eligible</th>
              <th className="text-center">Allowed</th>
              {this.props.game && this.props.game.pickup_deadline < timestamp
                ? <th>Current winner</th>
                : null}
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody id="studentList">
            {this.state.students.map(function (value, i) {
              return (<StudentRow
                key={i}
                student={value}
                resetRows={this.reset}
                canAdd={this.props.canAdd}
                spots={this.state.availableSpots}
                setMessage={this.setMessage}
                game={this.props.game}/>)
            }.bind(this))}
          </tbody>
        </table>
        {nextButton
}
      </div>
    )
  }

}

Students.defaultProps = {}
Students.propTypes = {
  game: React.PropTypes.object,
  canAdd: React.PropTypes.bool
}

export default Students
