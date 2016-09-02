/* global $ */

import React from 'react'
import TextInput from '../Mixin/TextInput.jsx'
import Alert from '../Mixin/Alert.jsx'

class VisitorForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {message: ''}
  }

  save() {
    let university = $('#university').val()
    let mascot = $('#mascot').val()

    if (university.length > 0 && mascot.length > 0) {
      $.post('tailgate/Admin/Visitor', {
        command: 'add',
        university: university,
        mascot: mascot
      }).done(function () {
        this.props.closeForm()
        this.props.loadVisitors()
      }.bind(this)).fail(function () {
        let error_message = <Alert
          message={'Error: Check your university and mascot inputs for correct information'}/>
        this.setState({message: error_message})
      }.bind(this))
    }
  }

  render() {
    return (
      <div>
        <div className="row well">
          {this.state.message}
          <div className="form-group col-sm-6">
            <TextInput label={'University:'} inputId={'university'}/>
          </div>
          <div className="form-group col-sm-6">
            <TextInput label={'Mascot:'} inputId={'mascot'}/>
          </div>
          <div className="col-sm-12 text-center">
            <button className="btn btn-primary" onClick={this.save}>
              <i className="fa fa-save"></i>
            Save</button>&nbsp;
            <button className="btn btn-default" onClick={this.props.closeForm}>
              <i className="fa fa-times"></i>
            Close</button>
          </div>
        </div>
      </div>
    )
  }
}

VisitorForm.defaultProps = {
  closeForm : null,
  loadVisitors: null
}

VisitorForm.propTypes = {
  closeForm: React.PropTypes.func,
  loadVisitors: React.PropTypes.func
}

export default VisitorForm
