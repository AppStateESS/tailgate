import React from 'react'

class Alert extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="alert alert-danger" role="alert">
        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <i className="fa fa-exclamation-circle"></i>
        {this.props.message}
      </div>
    );
  }
}

Alert.defaultProps = {};

export default Alert;
