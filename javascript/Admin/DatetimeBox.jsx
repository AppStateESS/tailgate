import React from 'react'

class DatetimeBox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="col-sm-3">
        <div className={'alert alert-' + this.props.bgColor}>
          {this.props.button}
          <big>
            <strong>{this.props.title}</strong>
          </big><br/> {this.props.date}
        </div>
      </div>
    );
  }
}

export default DatetimeBox;
