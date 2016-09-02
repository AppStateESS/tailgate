import React from 'react'

class NAME extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: ''};
  }
  save() {
    let title = $('#lotTitle').val();
    let totalSpaces = +$('#totalSpaces').val();
    if (title.length > 0 && totalSpaces > 0) {
      $.post('tailgate/Admin/Lot', {
        command: 'add',
        title: title,
        default_spots: totalSpaces
      }).done(function () {
        this.props.closeForm();
        this.props.loadLots();
      }.bind(this)).fail(function () {
        let error_message = <Alert
          message={'Error: Check your lot name and total spaces for correct information'}/>;
        this.setState({message: error_message});
      }.bind(this));
    }

  }

  forceNumbers(e) {
    if (e.which < 48 || e.which > 57) {
      e.preventDefault();
    }
  }

  render() {
    return (
      <div>
        <div className="row well">
          {this.state.message}
          <div className="form-group col-sm-6">
            <TextInput label={'Name of lot'} inputId={'lotTitle'} required={true}/>
          </div>
          <div className="form-group col-sm-3">
            <TextInput
              label={'Total spaces:'}
              inputId={'totalSpaces'}
              handlePress={this.forceNumbers}
              required={true}/>
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
    );
  }

}

NAME.defaultProps = {};

export default NAME;
