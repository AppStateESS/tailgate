import React from 'react'
import TextInput from '../Mixin/TextInput.jsx'
import Alert from '../Mixin/Alert.jsx'

/* global $ */

class LotForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      title : '',
      totalSpaces: ''
    }
    this.save = this.save.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
    this.updateSpaces = this.updateSpaces.bind(this)
  }

  save() {
    if (this.state.title.length > 0 && this.state.totalSpaces > 0) {
      $.post('tailgate/Admin/Lot', {
        command: 'add',
        title: this.state.title,
        default_spots: this.state.totalSpaces
      }).done(function () {
        this.props.closeForm()
        this.props.loadLots()
      }.bind(this)).fail(function () {
        let error_message = <Alert
          message={'Error: Check your lot name and total spaces for correct information'}/>
        this.setState({message: error_message})
      }.bind(this))
    }

  }

  forceNumbers(e) {
    if (e.which < 48 || e.which > 57) {
      e.preventDefault()
    }
  }

  updateTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  updateSpaces(e) {
    this.setState({
      totalSpaces: e.target.value
    })
  }

  render() {
    return (
      <div>
        <div className="row well">
          {this.state.message}
          <div className="form-group col-sm-6">
            <TextInput
              label={'Name of lot:'}
              inputId={'lotTitle'}
              required={true}
              handleChange={this.updateTitle}
              value={this.state.title}/>
          </div>
          <div className="form-group col-sm-3">
            <TextInput
              label={'Total spaces:'}
              inputId={'totalSpaces'}
              handlePress={this.forceNumbers}
              handleChange={this.updateSpaces}
              required={true}
              value={this.state.totalSpaces}/>
          </div>
          <div className="col-sm-12 text-center">
            <button className="btn btn-primary" onClick={this.save}>
              <i className="fa fa-save"></i>&nbsp; Save</button>&nbsp;
            <button className="btn btn-default" onClick={this.props.closeForm}>
              <i className="fa fa-times"></i>&nbsp; Close</button>
          </div>
        </div>
      </div>
    )
  }

}

LotForm.defaultProps = {}

LotForm.propTypes = {
  closeForm: React.PropTypes.func,
  loadLots: React.PropTypes.func
}

export default LotForm
