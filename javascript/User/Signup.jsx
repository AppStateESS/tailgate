import React from 'react'
import ReactDOM from 'react-dom'
import TextInput from '../Mixin/TextInput.jsx'

class Signup extends React.Component {
  constructor() {
    super()
    this.state = {
      firstName: '',
      lastName: '',
      fnError: false,
      lnError: false,
      disableButton: false
    }
    this.updateFirstName = this.updateFirstName.bind(this)
    this.updateLastName = this.updateLastName.bind(this)
    this.checkNames = this.checkNames.bind(this)
  }

  checkNames(e) {
    this.setState({disableButton: true})
    if (this.state.firstName.length === 0) {
      this.setState({fnError: true})
      e.preventDefault()
    }

    if (this.state.lastName.length === 0) {
      this.setState({lnError: true})
      e.preventDefault()
    }
    this.setState({disableButton: false})
  }

  updateFirstName(e) {
    this.setState({firstName: e.target.value})
  }

  updateLastName(e) {
    this.setState({lastName: e.target.value})
  }

  render() {
    const redBorder = {
      borderColor: 'red'
    }
    return (
      <div>
        <p>Before getting started, please enter your first and last name.</p>
        <form method="post" action="tailgate/User/Student">
          <input type="hidden" name="command" value="createNewAccount"/>
          <div className="row">
            <div className="col-sm-6">
              <TextInput
                label={'First name'}
                name="firstName"
                required={true}
                handleChange={this.updateFirstName}
                style={this.state.fnError
                ? redBorder
                : null}
                placeholder={this.state.fnError
                ? 'First name may not be empty'
                : null}
                value={this.state.firstName}/>
            </div>
            <div className="col-sm-6">
              <TextInput
                label={'Last name'}
                name="lastName"
                required={true}
                handleChange={this.updateLastName}
                style={this.state.lnError
                ? redBorder
                : null}
                placeholder={this.state.lnError
                ? 'Last name may not be empty'
                : null}
                value={this.state.lastName}/>
            </div>
          </div>
          <div className="text-center" style={{
            marginTop: '1em'
          }}>
            <button
              className="btn btn-primary"
              onClick={this.checkNames}
              disabled={this.state.disableButton}>
              <i className="fa fa-check"></i>&nbsp; Create new account</button>
          </div>
        </form>
      </div>
    )
  }
}

ReactDOM.render(
  <Signup/>, document.getElementById('student-signup'))
