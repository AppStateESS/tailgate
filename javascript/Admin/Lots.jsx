import React from 'react'
import LotForm from './LotForm.jsx'
import LotListing from './LotListing.jsx'

class Lots extends React.Component {
  constructor(props) {
    super(props)
    this.state = {showForm: false}
  }

  render() {
    let lotForm
    if (this.state.showForm) {
      lotForm = <LotForm closeForm={this.hideForm} loadLots={this.props.loadLots}/>
    } else {
      lotForm = null
    }
    return (
      <div>
        <p>
          <button className="btn btn-success" onClick={this.showForm}>
            <i className="fa fa-plus"></i>
          Add Tailgating Lot</button>
        </p>
        {lotForm}
        <LotListing
          lots={this.props.lots}
          loadLots={this.props.loadLots}
          game={this.props.game}/>
      </div>
    )
  }
}

Lots.propTypes = {
  loadLots : React.PropTypes.func,
  lots : React.PropTypes.array,
  game: React.PropTypes.object

}

export default Lots
