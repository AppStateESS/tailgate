import React from 'react'
/* global $ */

class TextInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleBlur(e) {
    if (this.props.required && e.target.value.length < 1) {
      $(e.target).css('border-color', 'red')
    }
    if (this.props.handleBlur) {
      this.props.handleBlur(e)
    }
  }

  handleFocus(e) {
    $(e.target).css('border-color', '')
  }

  render() {
    let label = ''
    let required = ''
    if (this.props.label.length > 0) {
      if (this.props.required) {
        required = <i className="fa fa-asterisk text-danger"></i>
      }
      label = <label htmlFor={this.props.inputId}>{this.props.label}</label>
    } else {
      label = null
    }
    if (this.props.defaultValue === null) {
      return (
        <div className="form-group">
          {label}
          {required}
          <input
            type="text"
            className="form-control"
            id={this.props.inputId}
            name={this.props.inputId}
            placeholder={this.props.placeholder}
            onFocus={this.handleFocus}
            onChange={this.props.handleChange}W
            onBlur={this.handleBlur}
            onKeyPress={this.props.handlePress}
            value={this.props.value}/>
        </div>
      )
    } else {
      return (
        <div className="form-group">
          {label}
          {required}
          <input
            type="text"
            className="form-control"
            id={this.props.inputId}
            name={this.props.inputId}
            placeholder={this.props.placeholder}
            onFocus={this.handleFocus}
            onChange={this.props.handleChange}
            onBlur={this.handleBlur}
            onKeyPress={this.props.handlePress}
            defaultValue={this.props.defaultValue}/>
        </div>
      )

    }
  }
}

TextInput.defaultProps = {
  label: '',
  placeholder: '',
  handleBlur: null,
  required: false,
  handlePress: null,
  handleChange: null,
  inputId: null,
  defaultValue: null,
  value: ''
}

TextInput.propTypes = {
  inputId: React.PropTypes.string,
  label: React.PropTypes.string,
  required: React.PropTypes.bool,
  handleBlur: React.PropTypes.func,
  handlePress: React.PropTypes.func,
  handleChange: React.PropTypes.func,
  placeholder: React.PropTypes.string,
  defaultValue: React.PropTypes.string,
  value: React.PropTypes.string
}

export default TextInput
