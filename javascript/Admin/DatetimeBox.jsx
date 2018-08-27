import React from 'react'
import PropTypes from 'prop-types'

class DatetimeBox extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="col-sm-12">
        <div className={'alert alert-' + this.props.bgColor}>
          {this.props.button}
          <big>
            <strong>{this.props.title}</strong>
          </big><br/> {this.props.date}
        </div>
      </div>
    )
  }
}

DatetimeBox.propTypes = {
  button: PropTypes.element,
  title: PropTypes.string,
  date: PropTypes.string,
  bgColor: PropTypes.string
}

export default DatetimeBox
