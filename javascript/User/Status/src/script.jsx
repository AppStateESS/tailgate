var Status = React.createClass({
    getInitialState: function() {
        return {
            student : {},
            currentGame : {id : 0},
            lottery : null,
            spot : {}
        };
    },

    loadData : function() {
        var student;
        var currentGame;
        var lottery;
        var spot;

        $.getJSON('tailgate/User/Student', {
            command: 'get'
        }).done(function(data) {
            student = data;
            $.getJSON('tailgate/User/Game', {
                command: 'getCurrent'
            }).done(function(data) {
                currentGame = data;
                if (currentGame) {
                    $.getJSON('tailgate/User/Lottery', {
                        command: 'get',
                        game_id: data.id
                    }).done(function(data) {
                        lottery = data;
                        if (lottery) {
                            $.getJSON('tailgate/User/Lottery', {
                                command : 'getSpotInfo',
                                lotteryId : lottery.id
                            }).done(function(data){
                                spot = data;
                                this.setState({
                                    student: student,
                                    currentGame: currentGame,
                                    lottery: lottery,
                                    spot : spot
                                });
                            }.bind(this));
                        } else {
                            this.setState({
                                student: student,
                                currentGame: currentGame,
                                lottery: lottery
                            });
                        }
                    }.bind(this));
                } else {
                    this.setState({
                        student: student,
                    });
                }
            }.bind(this));
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadData();
    },

    render : function() {
        var content;
        if (this.state.currentGame.id === 0) {
            content = <h4>No games scheduled. Try back later.</h4>;
        } else {
            content = <Game game={this.state.currentGame} lottery={this.state.lottery} spot={this.state.spot} reload={this.loadData}/>;
        }
        return (
            <div>
                <h2>Welcome {this.state.student.first_name} {this.state.student.last_name}</h2>
                {content}
            </div>
        );
    }
});



var Game = React.createClass({
    getDefaultProps: function() {
        return {
            game : {},
            lottery : {},
            spot : {}
        };
    },


    render : function() {
        return (
            <div>
                {this.props.game.length > 0 ? <h3>{this.props.game.university} {this.props.game.mascot} - {this.props.game.kickoff_format}</h3> : null}
                <GameStatus game={this.props.game} lottery={this.props.lottery} spot={this.props.spot} updateLottery={this.props.reload}/>
            </div>
        );
    }
});

var GameStatus = React.createClass({
    submitLottery : function() {
        var lot_id = $('#lotSelect').val();
        $.post('tailgate/User/Lottery', {
            command : 'apply',
            game_id : this.props.game.id
        }).done(function(data){
            this.props.updateLottery();
        }.bind(this));
    },

    render : function() {
        var content = null;
        var timestamp = Math.floor(Date.now() / 1000);
        if (this.props.game.id === undefined) {
            content = <div className="alert alert-info">The next lottery has not been created yet. Check back later.</div>;
        } else if(this.props.game.id === 0) {
            content = null;
        } else {
            if (this.props.game.lottery_run === '1') {
                // lottery has been run
                if (this.props.lottery) {
                    // check if student submitted a lottery
                    if (this.props.lottery.winner === '1') {
                        // see if current student is a winner
                        if (this.props.lottery.confirmed === '1') {
                            // current student has confirmed their spot via email
                            if (this.props.lottery.spot_id !== '0') {
                                content = <div className="alert alert-info">You have chosen lot <strong>{this.props.spot.title}</strong>, spot number <strong>{this.props.spot.number}</strong>. Make sure to go pick up your tag.</div>;
                            } else {
                                content = <div><ConfirmSpot lottery={this.props.lottery} updateLottery={this.props.updateLottery}/></div>;
                            }
                        } else {
                            // current student has not confirmed their spot
                            content = <div className="alert alert-success">Congratulations, you won a lottery spot! Check your email for your confirmation email.</div>;
                        }
                    } else {
                        // student submitted but did not win
                        content = <div className="alert alert-info">Sorry, you did not win a spot this time. Try again next game.</div>;
                    }
                } else {
                    // student did not submit a ticket for current lottery
                    content = <div className="alert alert-danger">The lottery is complete. Come back for the next game.</div>;
                }
            } else {
                // lottery has not been run yet
                if (timestamp >= this.props.game.signup_end) {
                    // signup time is over
                    if (this.props.lottery) {
                        // the student submitted a ticket
                        content = <div className="alert alert-info">Your application has been submitted. Watch your email and check back later for lottery results.</div>;
                    } else {
                        // the student didn't submit a ticket.
                        content = <div className="alert alert-info">Sorry, you missed the lottery sign up deadline. Try again next game.</div>;
                    }
                } else if (this.props.game.signup_start <= timestamp) {
                    // the sign up start has passed.
                    if (this.props.lottery) {
                        // the student submitted a ticket.
                        content = <div className="alert alert-info">Your application has been submitted. Check your email after {this.props.game.signup_end_format} for lottery results.</div>;
                    } else {
                        // the student hasn't submitted a ticket, show them the form
                        content = <LotterySubmit game={this.props.game} handleClick={this.submitLottery}/>;
                    }
                } else {
                    // the lottery signup has not yet begun
                    content = <div className="alert alert-success">Tailgate lottery for this game begins at <strong>{this.props.game.signup_start_format}</strong>. See you then!</div>;
                }
            }
        }
        return content;
    }
});



var ConfirmSpot = React.createClass({
    getInitialState: function() {
        return {
            availableLots: []
        };
    },

    getDefaultProps: function() {
        return {
            lottery : {}
        };
    },

    componentDidMount: function() {

        $.getJSON('tailgate/User/Lottery', {
            command: 'getAvailableLots'
        }).done(function(data){
            this.setState({
                availableLots : data
            });
        }.bind(this));
    },

    confirmSpot : function() {
        var lotId = $('#lot-choice').val();
        var lotteryId = this.props.lottery.id;
        $.post('tailgate/User/Lottery', {
            command : 'pickLot',
            lotId : lotId,
            lotteryId : lotteryId
        },null, 'json').done(function(data){
            this.props.updateLottery();
        }.bind(this));
    },

    render : function() {
        var availableLots = this.state.availableLots;
        if (availableLots.length > 0) {
            var options = availableLots.map(function(val, i){
                return (<option key={i} value={val.lot_id}>{val.lot_title} - {val.available} slots</option>);
            });
            return (
                <div className="row">
                    <div className="col-sm-12">
                        <p>You have confirmed your winning ticket. Pick the lot you wish to tailgate in below. Choose quickly, other winners may be picking spots while you decide.</p>
                    </div>
                    <div className="col-sm-4">
                        <select id="lot-choice" className="form-control">
                            {options}
                        </select>
                    </div>
                    <div className="col-sm-4">
                        <button className="btn btn-primary" onClick={this.confirmSpot}>Choose tailgating lot</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <p>We have run out of spots. Contact the site administrator.</p>
                </div>
            );
        }
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
