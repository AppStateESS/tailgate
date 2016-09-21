import React from 'react'
import GameStatus from './GameStatus.jsx'

class Game extends React.Component {
  render() {
    return (
      <div>
        {this.props.game.length > 0
          ? (
            <h3>
              {this.props.game.university}&nbsp;
              {this.props.game.mascot}&nbsp;
              - {this.props.game.kickoff_format}
            </h3>
          )
          : null}
        <GameStatus
          game={this.props.game}
          lottery={this.props.lottery}
          spot={this.props.spot}
          loadData={this.props.loadData}/>
      </div>
    )
  }
}

Game.propTypes = {
  game: React.PropTypes.object,
  lottery: React.PropTypes.object,
  spot: React.PropTypes.object,
  loadData: React.PropTypes.func
}

export default Game
