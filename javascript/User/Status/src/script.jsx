var Status = React.createClass({
    getInitialState: function() {
        return {
            student : {},
            currentGame : {},
            lottery : null
        };
    },

    loadData : function() {
        var student;
        var currentGame;
        var lottery;

        $.getJSON('tailgate/User/Student', {
            command: 'get',
            student_id: student_id
        }).done(function(data) {
            student = data;
            $.getJSON('tailgate/User/Game', {
                command: 'getCurrent'
            }).done(function(data) {
                currentGame = data;
                $.getJSON('tailgate/User/Game', {
                    command: 'getLottery',
                    game_id: data.id
                }).done(function(data) {
                    lottery = data;

                    this.setState({
                        student: student,
                        currentGame: currentGame,
                        lottery: lottery
                    });

                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadData();
    },

    render : function() {
        return (
            <div>
                <h2>Welcome {this.state.student.first_name} {this.state.student.last_name}</h2>
                {this.state.currentGame ? <Game game={this.state.currentGame} lottery={this.state.lottery} reload={this.loadData}/> : <div>No games scheduled.</div>}
            </div>
        );
    }
});

var Game = React.createClass({

    submitLottery : function() {
        var lot_id = $('#lotSelect').val();
        $.post('tailgate/User/Game', {
            command : 'apply',
            game_id : this.props.game.id,
            student_id : student_id
        }).done(function(data){
            this.props.reload();
        }.bind(this));
    },

    render : function() {
        var game = this.props.game;
        var timestamp = Math.floor(Date.now() / 1000);
        var content = null;

        if (timestamp >= game.signup_end) {
            // signup is over
            if (game.lottery_run === '1') {
                content = <div className="alert alert-primary">The lottery for this game is complete.</div>;
            } else {
                if (this.props.lottery) {
                    content = <div className="alert alert-info">Your application has been submitted. Check back later for lottery results.</div>;
                } else {
                    content = <div className="alert alert-danger">Lottery signup is complete. No new applications are accepted.</div>;
                }
            }
        } else if (game.signup_start <= timestamp) {
            if (this.props.lottery) {
                content = <div className="alert alert-info">Your application has been submitted. Check back later for lottery results.</div>;
            } else {
                content = <LotterySubmit game={game} handleClick={this.submitLottery}/>;
            }
        } else {
            if(game.id !== undefined) {
                content = <div className="alert alert-success">Tailgate lottery for this game begins at <strong>{game.signup_start_format}</strong>. See you then!</div>;
            }
        }

        return (
            <div className="text-center">
                <h3>{game.university} {game.mascot} - {game.kickoff_format}</h3>
                {content}
            </div>
        );
    }
});

var LotterySubmit = React.createClass({
    render : function() {
        var game = this.props.game;
        return (
            <div>
                <p>Lottery submission deadline: {game.signup_end_format}</p>
                <p style={{marginTop : '1em'}}>
                    <button className="btn btn-primary btn-lg" onClick={this.props.handleClick}><i className="fa fa-check-square"></i> Submit my name to the tailgate lottery</button>
                </p>
                <p><small><em>Lottery winners will choose their spot on a first come, first serve basis.</em></small></p>
            </div>
        );
    }
});

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(<Status/>, document.getElementById('studentStatus'));
