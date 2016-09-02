import React from 'react'

/* global $ */

class VisitorRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showForm: false
    }
    this.edit = this.edit.bind(this)
    this.view = this.view.bind(this)
  }

  edit() {
    this.setState({showForm: true})
  }

  view() {
    this.setState({showForm: false})
    this.props.update()
  }

  render() {
    let rowContent = null
    let editButton = null

    if (this.state.showForm) {
      rowContent = <VisitorRowForm value={this.props.value} update={this.view}/>
      editButton = null
    } else {
      rowContent = (
        <div>
          {this.props.value.university}&nbsp;-&nbsp;{this.props.value.mascot}
        </div>
      )
      editButton = <VisitorRowEditButton handleClick={this.edit}/>
    }

    return (
      <tr>
        <td>
          {editButton}
          {this.props.game && this.props.game.visitor_id !== this.props.value.id
            ? <VisitorRowDeleteButton handleClick={this.props.remove}/>
            : null}
          {rowContent}
        </td>
      </tr>
    )
  }
}

VisitorRow.propTypes = {
  update: React.PropTypes.func,
  remove: React.PropTypes.func,
  value: React.PropTypes.object,
  game: React.PropTypes.object
}

export default VisitorRow

class VisitorRowEditButton extends React.Component {

  render() {
    let bstyle = {
      marginRight: '.5em'
    }
    return (
      <button
        style={bstyle}
        className="btn btn-sm btn-primary pull-right"
        onClick={this.props.handleClick}>
        <i className="fa fa-edit"></i>
        Edit
      </button>
    )
  }
}
VisitorRowEditButton.propTypes = {
  handleClick: React.PropTypes.func
}

class VisitorRowDeleteButton extends React.Component {
  render() {
    let bstyle = {
      marginRight: '.5em'
    }
    return (
      <button
        style={bstyle}
        className="btn btn-sm btn-danger pull-right"
        onClick={this.props.handleClick}>
        <i className="fa fa-times"></i>&nbsp; Remove
      </button>
    )
  }
}

VisitorRowDeleteButton.propTypes = {
  handleClick: React.PropTypes.func
}

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
        <div className="col-sm-2">
          <button className="btn btn-primary btn-sm" onClick={this.update}>
            <i className="fa fa-save"></i>
            Update
          </button>
        </div>
      </div>
    )
  }
}

VisitorRowForm.propTypes = {
  handleClick: React.PropTypes.func,
  update: React.PropTypes.func,
  value: React.PropTypes.object
}
