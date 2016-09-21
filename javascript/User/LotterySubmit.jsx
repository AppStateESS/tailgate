import React from 'react'

class LotterySubmit extends React.Component {
  render() {
    const game = this.props.game
    return (
      <div>
        <p>Lottery submission deadline: {game.signup_end_format}</p>
        <p style={{
          marginTop: '1em'
        }}>
          <button className="btn btn-primary btn-lg" onClick={this.props.handleClick}>
            <i className="fa fa-check-square"></i>&nbsp;
            Submit my name to the tailgate lottery</button>
        </p>
        <p>
          <small>
            <em>Lottery winners will choose their spot on a first come, first serve basis.</em>
          </small>
        </p>
      </div>
    )
  }
}

LotterySubmit.propTypes = {
  game: React.PropTypes.object,
  handleClick: React.PropTypes.func
}

export default LotterySubmit
