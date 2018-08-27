import React from 'react'
import VisitorRowForm from './VisitorRowForm.jsx'
import PropTypes from 'prop-types'

class VisitorRow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showForm: false
    }
    this.showForm = this.showForm.bind(this)
    this.hideForm = this.hideForm.bind(this)
    this.update = this.update.bind(this)
  }

  showForm() {
    this.setState({
      showForm: true
    })
  }

  hideForm() {
    this.setState({
      showForm: false
    })
  }

  update() {
    this.setState({showForm: false})
    this.props.update()
  }

  render() {
    let rowContent = null
    let editButton = null

    if (this.state.showForm) {
      rowContent = <VisitorRowForm value={this.props.value} update={this.update} hide={this.hideForm}/>
      editButton = null
    } else {
      rowContent = (
        <div>
          {this.props.value.university}&nbsp;-&nbsp;{this.props.value.mascot}
        </div>
      )
      editButton = <VisitorRowEditButton handleClick={this.showForm}/>
    }
    return (
      <tr>
        <td>
          {editButton}
          {this.props.game === null || (this.props.game && this.props.game.visitor_id !== this.props.value.id)
            ? <VisitorRowDeleteButton handleClick={this.props.remove}/>
            : null}
          {rowContent}
        </td>
      </tr>
    )
  }
}

VisitorRow.propTypes = {
  update: PropTypes.func,
  remove: PropTypes.func,
  value: PropTypes.object,
  game: PropTypes.object,
  hideForm: PropTypes.func
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
        <i className="fa fa-edit"></i>&nbsp; Edit
      </button>
    )
  }
}

VisitorRowEditButton.propTypes = {
  handleClick: PropTypes.func
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
        <i className="fa fa-times"></i>&nbsp;Remove
      </button>
    )
  }
}

VisitorRowDeleteButton.propTypes = {
  handleClick: PropTypes.func
}
