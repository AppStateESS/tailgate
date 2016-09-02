import React from 'react';

class EditDateButton extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <button
        className="pull-right btn btn-sm btn-primary"
        id={this.props.buttonId}
        onClick={this.props.handleClick}>Edit</button>
    );
  }
}

EditDateButton.defaultProps = {buttonId: null, handleClick: null}

export default EditDateButton;
