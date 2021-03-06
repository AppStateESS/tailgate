import React from 'react'
import TextInput from '../Mixin/TextInput.jsx'

/* global $,CKEDITOR */

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      newAccountInformation: '',
      replyTo: ''
    }
    this.updateReplyTo = this.updateReplyTo.bind(this)
    this.submitForm = this.submitForm.bind(this)
  }

  componentDidMount() {
    this.newAccountEditor = CKEDITOR.replace('newAccountInformation')
    $.getJSON('tailgate/Admin/Settings', {command: 'list'}).done(function (data) {
      this.setState({newAccountInformation: data.new_account_information, replyTo: data.reply_to})
      this.newAccountEditor.setData(data.new_account_information)
    }.bind(this))
  }

  submitForm(e) {
    e.preventDefault()
    $.getJSON('tailgate/Admin/Settings', {
      command: 'testEmail',
      replyTo: this.state.replyTo
    }).done(function (data) {
      if (data.success === false) {
        $('#replyTo').css('borderColor', 'red')
      } else {
        $('#settingsForm').submit()
      }
    })
  }

  updateReplyTo(e) {
    this.setState({replyTo : e.target.value})
  }

  render() {
    return (
      <div>
        <form method="post" action="tailgate/Admin/Settings/" id="settingsForm">
          <input type="hidden" name="command" value="save"/>
          <TextInput
            required={true}
            inputId={'replyTo'}
            label={'Reply to email address'}
            placeholder={'Enter an email address students can reply to'}
            name="replyTo"
            value={this.state.replyTo}
            handleChange={this.updateReplyTo}
            />
          <label>Tailgate new student account information</label>
          <textarea
            id="newAccountInformation"
            className="form-control"
            name="newAccountInformation"
            defaultValue={this.state.newAccountInformation}/>
          <div style={{
            marginTop: '1em'
          }}>
            <button className="btn btn-success" onClick={this.submitForm}>
              <i className="fa fa-save"></i>&nbsp; Save content</button>
          </div>
        </form>
      </div>
    )
  }
}

Settings.defaultProps = {}

export default Settings
