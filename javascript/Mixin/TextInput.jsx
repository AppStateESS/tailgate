import React from 'react'
import PropTypes from 'prop-types'


class TextInput extends React.Component {
  constructor(props) {
    super(props)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
  }

  handleBlur(e) {
    let emptyMessage = 'Value may not be empty'
    if (this.props.label.length > 0) {
      emptyMessage = this.props.label + ' may not be empty'
    }
    if (this.props.required && e.target.value.length < 1) {
      this.refs.textInput.style['borderColor'] = 'red'
      this.refs.textInput.placeholder = emptyMessage
    }
    if (this.props.handleBlur) {
      this.props.handleBlur(e)
    }
  }

  handleFocus() {
    this.refs.textInput.style['borderColor'] = ''
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
            name={this.props.name}
            placeholder={this.props.placeholder}
            onFocus={this.handleFocus}
            onChange={this.props.handleChange}
            onBlur={this.handleBlur}
            onKeyPress={this.props.handlePress}
            value={this.props.value}
            style={this.props.style}
            ref="textInput"/>
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
            name={this.props.name}
            placeholder={this.props.placeholder}
            onFocus={this.handleFocus}
            onChange={this.props.handleChange}
            onBlur={this.handleBlur}
            onKeyPress={this.props.handlePress}
            style={this.props.style}
            ref="textInput"
            defaultValue={this.props.defaultValue}/>
        </div>
      )

    }
  }
}

TextInput.defaultProps = {
  name : '',
  label: '',
  placeholder: '',
  handleBlur: null,
  required: false,
  handlePress: null,
  handleChange: null,
  inputId: null,
  defaultValue: null,
  value: '',
  style: {}
}

TextInput.propTypes = {
  name: PropTypes.string,
  inputId: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  handleBlur: PropTypes.func,
  handlePress: PropTypes.func,
  handleChange: PropTypes.func,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  style: PropTypes.object
}

export default TextInput
