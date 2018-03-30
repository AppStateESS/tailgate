import React from 'react'
import {EligibleIcon, BannedIcon} from './StudentRowIcons.jsx'

/* global $ */

class StudentRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.addSpot = this.addSpot.bind(this)
    this.deleteStudent = this.deleteStudent.bind(this)
    this.eligible = this.eligible.bind(this)
    this.bannedReason = this.bannedReason.bind(this)
  }

  eligible() {
    if (this.props.student.eligible === '1') {
      this.makeIneligible(this.props.resetRows)
    } else {
      this.makeEligible(this.props.resetRows)
    }
  }

  makeIneligible(reset) {
    let content = '<textarea id="ineligibleReason" class="form-control" name="ineligibleReason" pla' +
        'ceholder="Please enter the reason for making this student ineligible."></textare' +
        'a > <button style="margin-top:1em" id="makeIneligible" class="btn btn-danger"><i' +
        ' class="fa fa-ban"></i> Prevent user from applying for current tailgate</button>'
    $('#admin-modal .modal-title').text('Make user ineligible: ' + this.props.student.first_name + ' ' + this.props.student.last_name)
    $('#admin-modal .modal-body').html(content)
    $('#makeIneligible').click(function () {
      let reason = $('#ineligibleReason').val()
      if (reason.length < 1) {
        $('#ineligibleReason').css('border-color', 'red')
      }
      $.post('tailgate/Admin/Student', {
        command: 'ineligible',
        id: this.props.student.id,
        reason: reason
      }).done(function () {
        reset()
      }.bind(this))
      $('#admin-modal').modal('hide')
    }.bind(this))
    $('#admin-modal').modal('show')
  }

  makeEligible(reset) {
    if (confirm('Click OK if you are sure you want to restore this student\'s eligiblity. Cancel ' +
        'if not.')) {
      $.post('tailgate/Admin/Student', {
        command: 'eligible',
        id: this.props.student.id
      }).done(function () {
        reset()
      })
    }
  }

  bannedReason() {
    if (this.props.student.banned === '1') {
      this.unBan(this.props.resetRows)
    } else {
      this.ban(this.props.resetRows)
    }
  }

  unBan(reset) {
    if (confirm('Click OK if you are sure you want to remove this student\'s ban. Cancel if not.')) {
      $.post('tailgate/Admin/Student', {
        command: 'unban',
        id: this.props.student.id
      }).done(function () {
        reset()
      })
    }
  }

  options() {
    let options = this.props.spots.map(function (spot) {
      return '<option value="' + spot.id + '">' + spot.lot_title + ' #' + spot.number + '</option>'
    })
    return options
  }

  addSpot() {
    let content = '<select id="spotSelect" class="form-control"><option disable="true" value="0">- Choose spot below -</option>' + this.options() +
    '</select><button id="saveSpot" class="btn btn-success" style="margin-right:.5em">' +
        'Assign student</button>'
    $('#admin-modal .modal-title').text('Assign spot to ' + this.props.student.first_name + ' ' + this.props.student.last_name)
    $('#admin-modal .modal-body').html(content)

    $('#saveSpot').click(function () {
      let spotId = $('#spotSelect').val()
      if (spotId === '0') {
        return
      }
      $.post('tailgate/Admin/Student', {
        command: 'assign',
        studentId: this.props.student.id,
        spotId: spotId
      }, null, 'json').done(function (data) {
        if (data.success === true) {
          this.props.setMessage('Spot assigned.')
        } else {
          this.props.setMessage('Spot already taken.')
        }
        this.props.resetRows()
      }.bind(this))
      $('#admin-modal').modal('hide')
    }.bind(this))

    $('#admin-modal').modal('show')
  }

  ban() {
    let content = '<textarea id="bannedReason" class="form-control" name="bannedReason" placeholder' +
        '="Please enter the reason for the ban."></textarea><button style="margin-top:1em' +
        '" id="banUser" class="btn btn-danger"><i class="fa fa-ban"></i> Ban user from ac' +
        'cessing system</button>'
    $('#admin-modal .modal-title').text('Ban user: ' + this.props.student.first_name + ' ' + this.props.student.last_name)
    $('#admin-modal .modal-body').html(content)
    $('#banUser').click(function () {
      let bannedReason = $('#bannedReason').val()
      if (bannedReason.length < 1) {
        $('#bannedReason').css('border-color', 'red')
      }
      $.post('tailgate/Admin/Student', {
        command: 'ban',
        id: this.props.student.id,
        reason: bannedReason
      }).done(function () {
        this.props.resetRows()
      }.bind(this))
      $('#admin-modal').modal('hide')
    }.bind(this))
    $('#admin-modal').modal('show')
  }

  deleteStudent() {
    if (confirm('Are you sure you want to PERMANENTLY delete this student?')) {
      $.post('tailgate/Admin/Student', {
        command: 'delete',
        id: this.props.student.id
      }).done(function () {
        this.props.resetRows()
      }.bind(this))
    }
  }

  render() {
    let timestamp = Math.floor(Date.now() / 1000)
    let value = this.props.student
    let winner = null
    if (value.winner === '1' && value.picked_up === '1') {
      winner = <span className="text-success">Yes</span>
    } else if (value.banned === '1') {
      winner = <span className="text-danger">Banned</span>
    } else if (value.eligible === '0') {
      winner = <span className="text-warning">Ineligible</span>
    } else if (this.props.spots.length > 0) {
      let winnerStyle = {
        marginRight: '1em'
      }
      winner = <button
        className="btn btn-sm btn-primary"
        style={winnerStyle}
        onClick={this.addSpot}>
        <i className="fa fa-plus"></i>&nbsp; Add to spot</button>
    } else {
      winner = <span className="text-info">No</span>
    }
    let email = 'mailto:' + value.email
    let dangerStyle = {
      marginRight: '1em'
    }
    return (
      <tr>
        <td>{value.id}</td>
        <td>{value.last_name}</td>
        <td>{value.first_name}</td>
        <td>
          <a href={email}>{value.username}&nbsp;
            <i className="fa fa-envelope-o"></i>
          </a>
        </td>
        <td className="text-right col-sm-1">{value.wins}</td>
        <td className="text-center"><EligibleIcon value={value} handleClick={this.eligible}/></td>
        <td className="text-center"><BannedIcon value={value} handleClick={this.bannedReason}/></td>
        {this.props.game && this.props.game.pickup_deadline < timestamp
          ? <td>{winner}</td>
          : null}
        <td>
          <button
            className="btn btn-sm btn-danger"
            style={dangerStyle}
            onClick={this.deleteStudent}>
            <i className="far fa-trash-alt"></i>&nbsp; Delete</button>
        </td>
      </tr>
    )
  }

}

StudentRow.defaultProps = {}
StudentRow.propTypes = {
  student: React.PropTypes.object,
  spots: React.PropTypes.array,
  setMessage: React.PropTypes.func,
  resetRows: React.PropTypes.func,
  game: React.PropTypes.object
}

export default StudentRow
