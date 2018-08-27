import React from 'react'
import PropTypes from 'prop-types'

/* global $ */

class VisitorRowForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      university: '',
      mascot: ''
    }
    this.update = this.update.bind(this)
    this.updateUniversity = this.updateUniversity.bind(this)
    this.updateMascot = this.updateMascot.bind(this)
  }

  componentDidMount() {
    this.setState({university: this.props.value.university, mascot: this.props.value.mascot})
  }

  updateUniversity(event) {
    this.setState({university: event.target.value})
  }

  updateMascot(event) {
    this.setState({mascot: event.target.value})
  }

  update() {
    if (this.state.university.length === 0) {
      this.setState({university: this.props.value.university})
      return
    }
    if (this.state.mascot.length === 0) {
      this.setState({mascot: this.props.value.mascot})
      return
    }
    $.post('tailgate/Admin/Visitor', {
      command: 'update',
      university: this.state.university,
      mascot: this.state.mascot,
      visitorId: this.props.value.id
    }).done(function () {
      this.props.update()
    }.bind(this))
  }

  render() {
    const bump = {marginLeft: '1em'}
    return (
      <div className="row">
        <div className="col-sm-4">
          <input
            ref="university"
            type="text"
            className="form-control"
            value={this.state.university}
            onChange={this.updateUniversity}/>
        </div>
        <div className="col-sm-4">
          <input
            ref="mascot"
            type="text"
            className="form-control"
            value={this.state.mascot}
            onChange={this.updateMascot}/>
        </div>
        <div className="col-sm-4">
          <button className="btn btn-primary btn-sm" onClick={this.update}>
            <i className="fa fa-save"></i>&nbsp; Update
          </button>
          <button className="btn btn-danger btn-sm" style={bump} onClick={this.props.hide}>
            <i className="fa fa-times"></i>&nbsp; Close
          </button>
        </div>
      </div>
    )
  }
}

VisitorRowForm.propTypes = {
  handleClick: PropTypes.func,
  update: PropTypes.func,
  value: PropTypes.object,
  hide: PropTypes.func
}

export default VisitorRowForm
