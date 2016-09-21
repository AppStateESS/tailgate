import React from 'react'
import VisitorRow from './VisitorRow.jsx'
import VisitorForm from './VisitorForm.jsx'

/* global $ */

class Visitors extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visitors: [],
      showForm: false
    }
    this.loadVisitors = this.loadVisitors.bind(this)
    this.showForm = this.showForm.bind(this)
    this.hideForm = this.hideForm.bind(this)
  }

  showForm() {
    this.setState({showForm: true})
  }

  hideForm() {
    this.setState({showForm: false})
  }

  componentDidMount() {
    this.loadVisitors()
  }

  loadVisitors() {
    $.getJSON('tailgate/Admin/Visitor', {command: 'list'}).done(function (data) {
      if (data.length < 1) {
        data = []
      }
      this.setState({visitors: data})
    }.bind(this))
  }

  removeVisitor(index) {
    let visitor = this.state.visitors[index]
    $.post('tailgate/Admin/Visitor', {
      command: 'deactivate',
      visitor_id: visitor.id
    }, null, 'json').done(function () {
      this.loadVisitors()
    }.bind(this))
  }

  getVisitors() {
    let visitorRow = this.state.visitors.map(function (value, key) {
      return (<VisitorRow
        key={key}
        game={this.props.game}
        value={value}
        update={this.loadVisitors}
        remove={this.removeVisitor.bind(this, key)}
        hideForm={this.hideForm}/>)
    }.bind(this))
    return visitorRow
  }

  render() {
    let visitorForm = null
    if (this.state.showForm) {
      visitorForm = <VisitorForm closeForm={this.hideForm} loadVisitors={this.loadVisitors}/>
    }
    let visitors = this.getVisitors()

    return (
      <div>
        <p>
          <button className="btn btn-success" onClick={this.showForm}>
            <i className="fa fa-plus"></i>&nbsp; Add Team
          </button>
        </p>
        {visitorForm}
        <table className="table table-striped">
          <tbody>
            {visitors}
          </tbody>
        </table>
      </div>
    )
  }
}

Visitors.defaultProps = {
  game: {}
}
Visitors.propTypes = {
  game: React.PropTypes.object
}

export default Visitors
