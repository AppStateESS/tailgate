import React from 'react';

class RunLottery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spotsLeft: 0,
      messageLog: '',
    };
  }

  getTotalSpots() {
    let xhr = $.getJSON('tailgate/Admin/Lottery', {command: 'getAvailableSpots'});
    return xhr;
  }

  concatMessage(messageAdd) {
    let message = this.state.messageLog;
    this.setState({
      messageLog: message + "\n" + messageAdd
    });
  }

  chooseWinners() {
    let xhr = $.post('tailgate/Admin/Lottery', {
      command: 'chooseWinners'
    }, function() {}, 'json');
    return xhr;
  }

  closeLottery() {
    let xhr = $.post('tailgate/Admin/Lottery', {command: 'completeLottery'});
    return xhr;
  }

  notifyWinners() {
    let xhr = $.post('tailgate/Admin/Lottery', {
      command: 'notify'
    }, null, 'json');
    return xhr;
  }

  componentDidMount() {
    let currentGame = this.props.currentGame;
    if (currentGame.lottery_run === '1') {
      this.concatMessage('This lottery has already been run.');
      return;
    }
    this.concatMessage('Starting lottery. Do not refresh or leave page.');
    this.concatMessage('Checking number of available spots.');
    let totalSpotsXHR = this.getTotalSpots();
    totalSpotsXHR.done(function(data) {
      let totalSpots = data.available_spots;
      this.concatMessage(totalSpots + ' spots are available.');
      this.setState({spotsLeft: totalSpots});

      this.concatMessage('Assigning winners.');
      let winnersXHR = this.chooseWinners();
      winnersXHR.done(function(data) {
        this.concatMessage(data.spots_filled + ' spots filled.');
        this.concatMessage(data.spots_left + ' spots left.');
        this.setState({spotsLeft: data.spots_left});

        if (data.spots_filled === '0') {
          this.concatMessage('Finished. Closing lottery.');
          let closeXHR = this.closeLottery();
          closeXHR.done(function(data) {
            this.props.loadGame();
          }.bind(this));
        } else {
          this.concatMessage('Notifying winners and losers.');
          let notifyXHR = this.notifyWinners();
          notifyXHR.done(function(data) {
            this.concatMessage('Finished. Closing lottery.');
            let closeXHR = this.closeLottery();
            closeXHR.done(function(data) {
              this.props.loadGame();
            }.bind(this));
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
  }

  render() {
    return (
      <div>
        <h4>Running lottery for {this.props.currentGame.university}
          {this.props.currentGame.mascot}
          - {this.props.currentGame.kickoff_format}</h4>
        <div>
          <pre style={{height : '300px', width : '100%'}}>{this.state.messageLog}</pre></div>
            </div>
    );
  }
}

export default RunLottery;