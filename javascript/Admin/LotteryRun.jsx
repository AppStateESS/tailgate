import React from 'react'

class LotteryRun extends React.Component {
  constructor(props) {
    super(props);
    this.state = {start: false};
  }

  confirmLottery() {
    this.setState({start: true});
  }

  stopLottery() {
    this.setState({start: false});
  }

  render() {
    let button = null;
    let ctime = Date.now() / 1000;
    let currentTime = Math.floor(ctime);
    if (this.props.game.signup_end < currentTime) {
      if (this.state.start) {
        button = (
          <div>
            <p>Are you sure you want to start the lottery?</p>
            <button
              style={{
                marginRight: '1em'
              }}
              className="btn btn-success btn-lg"
              onClick={this.props.startLottery}>
              <i className="fa fa-check"></i>
            Confirm: Start lottery</button>
            <button className="btn btn-danger btn-lg" onClick={this.stopLottery}>
              <i className="fa fa-times"></i>
              Cancel running lottery</button>
          </div>
        );
      } else {
        button = <button className="btn btn-success btn-lg" onClick={this.confirmLottery}>Start lottery</button>;
      }
    }
    return (
      <div className="text-center">{button}</div>
    );
  }
}

export default LotteryRun;
