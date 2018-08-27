import React from 'react'

class Banned extends React.Component {
  render () {
    return (
      <div>
        <h2>Sorry</h2>
        <p>You were banned from using this site on {this.props.student.banned_date}.</p>
        <h3>Reason for ban</h3>
        <p className="well">{this.props.student.banned_reason}</p>
        <p>Contact the administrators of this site if you have questions.</p>
      </div>
    )
  }
}

Banned.propTypes = {
  student : PropTypes.object
}

export default Banned
