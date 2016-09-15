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
                    // get the student's lottery submission for the current game
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
                        currentGame : null,
                        student: student
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
        if (this.state.student.banned == 1) {
            return <Banned student={this.state.student}/>;
        }
        if (this.state.currentGame === null) {
            content = <h4>No games scheduled. Try back later.</h4>;
        } else {
            content = (<Game game={this.state.currentGame} lottery={this.state.lottery}
                 spot={this.state.spot} loadData={this.loadData}/>);
        }
        return (
            <div>
                <h2>Welcome {this.state.student.first_name} {this.state.student.last_name}</h2>
                {content}
            </div>
        );
    }
});

var Banned = React.createClass({

    getDefaultProps : function() {
        return {
            student : {}
        };
    },

    render: function() {
        return (
            <div>
                <h2>Sorry</h2>
                <p>You were banned from using this site on {this.props.student.banned_date}.</p>
                <h3>Reason for ban</h3>
                <p className="well">{this.props.student.banned_reason}</p>
                <p>Contact the administrators of this site if you have questions.</p>
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
                {this.props.game.length > 0 ? (
                    <h3>
                        {this.props.game.university} {this.props.game.mascot} - {this.props.game.kickoff_format}
                    </h3>) : null}
                <GameStatus game={this.props.game} lottery={this.props.lottery}
                    spot={this.props.spot} loadData={this.props.loadData}/>
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
            this.props.loadData();
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
                                if (this.props.lottery.picked_up === '1') {
                                    content = <div className="alert alert-info">Your tailgate tag has been picked up. Enjoy the game!</div>;
                                } else if(this.props.game.pickup_deadline < timestamp) {
                                    content = <div className="alert alert-info">Sorry, you failed to pick up your tailgating pass in time. It has been forfeited.</div>;
                                } else {
                                    content = <div className="alert alert-info">You have chosen lot <strong>{this.props.spot.title}</strong>, spot number <strong>{this.props.spot.number}</strong>. Make sure to go pick up your tag before the {this.props.game.pickup_deadline_format} deadline.<br />See the <a href="./">home page</a> for more details.</div>;
                                }
                            } else {
                                if (this.props.game.pickup_deadline < timestamp) {
                                    content = <div className="alert alert-info">Sorry, you failed to confirm your tailgating win. Your spot has been forfeited.</div>;
                                } else {
                                    content = <div><ConfirmSpot lottery={this.props.lottery} loadData={this.props.loadData}/></div>;
                                }
                            }
                        } else {
                            // current student has not confirmed their spot
                            content = <div className="alert alert-success"><strong>Congratulations,</strong> you won a lottery spot! Check your email to confirm your win.</div>;
                        }
                    } else {
                        // student submitted but did not win
                        content = <div className="alert alert-info">Sorry, you did not win a spot this time. Try again next game.</div>;
                    }
                } else {
                    // student did not submit a ticket for current lottery
                    content = <div className="alert alert-danger">The lottery is complete and the winners have been contacted. Please, try again next game.</div>;
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
            availableSpots: [],
            message : null,
            waiting : 0
        };
    },

    getDefaultProps: function() {
        return {
            lottery : {}
        };
    },

    componentDidMount: function() {
        this.loadAvailableSpots();
    },

    loadAvailableSpots : function() {
        $.getJSON('tailgate/User/Lottery', {
            command : 'spotChoice'
        }).done(function(data){
            this.setState({
                availableSpots : data
            });
        }.bind(this));
    },

    confirmSpot : function() {
        var spotId = this.refs.spotChoice.value;
        if (spotId === '0') {
            return;
        }
        var lotteryId = this.props.lottery.id;
        this.setState({
            waiting : 1
        });
        $.post('tailgate/User/Lottery', {
            command : 'pickSpot',
            spotId : spotId,
            lotteryId : lotteryId
        },null, 'json').done(function(data){
            if (data.success) {
                this.props.loadData();
            } else {
                this.setState({
                    waiting : 0
                });
                this.setState({
                    message : <div className="alert alert-danger">Your requested spot was chosen by someone else. Pick again.</div>
                });
                this.loadAvailableSpots();
            }
        }.bind(this));
    },

    render : function() {
        var sober;
        if (this.state.waiting === 1) {
            return <Waiting />;
        }
        if (this.state.availableSpots.length > 0) {
            var options = this.state.availableSpots.map(function(val, i){
                if (val.sober === '1') {
                    sober = '(Non-alcoholic)';
                } else {
                    sober = '';
                }
                return (<option key={i} value={val.id}>{val.lot_title + ', #' + val.number + ' ' + sober}</option>);
            });
            return (
                <div className="row">
                    <div className="col-sm-12">
                        <p>You have confirmed your winning ticket. Pick the spot you wish to tailgate in below. Choose quickly, other winners may be picking spots while you decide.</p>
                        {this.state.message}
                    </div>
                    <div className="col-sm-4">
                        <select ref="spotChoice" className="form-control">
                            <option disabled={true} selected={true} value="0">- Choose below -</option>
                            {options}
                        </select>
                    </div>
                    <div className="col-sm-4">
                        <button className="btn btn-primary" onClick={this.confirmSpot}>Confirm my tailgating spot</button>
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

var Waiting = React.createClass({
    render : function() {
        return (
            <div className="alert alert-success"><i className="fa fa-cog fa-spin fa-lg"></i> Please wait...</div>
        );
    }
});

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
ReactDOM.render(<Status/>, document.getElementById('studentStatus'));
