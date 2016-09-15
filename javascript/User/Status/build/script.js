var Status = React.createClass({
    displayName: 'Status',

    getInitialState: function () {
        return {
            student: {},
            currentGame: { id: 0 },
            lottery: null,
            spot: {}
        };
    },

    loadData: function () {
        var student;
        var currentGame;
        var lottery;
        var spot;

        $.getJSON('tailgate/User/Student', {
            command: 'get'
        }).done(function (data) {
            student = data;
            $.getJSON('tailgate/User/Game', {
                command: 'getCurrent'
            }).done(function (data) {
                currentGame = data;
                if (currentGame) {
                    // get the student's lottery submission for the current game
                    $.getJSON('tailgate/User/Lottery', {
                        command: 'get',
                        game_id: data.id
                    }).done(function (data) {
                        lottery = data;
                        if (lottery) {
                            $.getJSON('tailgate/User/Lottery', {
                                command: 'getSpotInfo',
                                lotteryId: lottery.id
                            }).done(function (data) {
                                spot = data;
                                this.setState({
                                    student: student,
                                    currentGame: currentGame,
                                    lottery: lottery,
                                    spot: spot
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
                        currentGame: null,
                        student: student
                    });
                }
            }.bind(this));
        }.bind(this));
    },

    componentDidMount: function () {
        this.loadData();
    },

    render: function () {
        var content;
        if (this.state.student.banned == 1) {
            return React.createElement(Banned, { student: this.state.student });
        }
        if (this.state.currentGame === null) {
            content = React.createElement(
                'h4',
                null,
                'No games scheduled. Try back later.'
            );
        } else {
            content = React.createElement(Game, { game: this.state.currentGame, lottery: this.state.lottery,
                spot: this.state.spot, loadData: this.loadData });
        }
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                null,
                'Welcome ',
                this.state.student.first_name,
                ' ',
                this.state.student.last_name
            ),
            content
        );
    }
});

var Banned = React.createClass({
    displayName: 'Banned',


    getDefaultProps: function () {
        return {
            student: {}
        };
    },

    render: function () {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'h2',
                null,
                'Sorry'
            ),
            React.createElement(
                'p',
                null,
                'You were banned from using this site on ',
                this.props.student.banned_date,
                '.'
            ),
            React.createElement(
                'h3',
                null,
                'Reason for ban'
            ),
            React.createElement(
                'p',
                { className: 'well' },
                this.props.student.banned_reason
            ),
            React.createElement(
                'p',
                null,
                'Contact the administrators of this site if you have questions.'
            )
        );
    }

});

var Game = React.createClass({
    displayName: 'Game',

    getDefaultProps: function () {
        return {
            game: {},
            lottery: {},
            spot: {}
        };
    },

    render: function () {
        return React.createElement(
            'div',
            null,
            this.props.game.length > 0 ? React.createElement(
                'h3',
                null,
                this.props.game.university,
                ' ',
                this.props.game.mascot,
                ' - ',
                this.props.game.kickoff_format
            ) : null,
            React.createElement(GameStatus, { game: this.props.game, lottery: this.props.lottery,
                spot: this.props.spot, loadData: this.props.loadData })
        );
    }
});

var GameStatus = React.createClass({
    displayName: 'GameStatus',

    submitLottery: function () {
        var lot_id = $('#lotSelect').val();
        $.post('tailgate/User/Lottery', {
            command: 'apply',
            game_id: this.props.game.id
        }).done(function (data) {
            this.props.loadData();
        }.bind(this));
    },

    render: function () {
        var content = null;
        var timestamp = Math.floor(Date.now() / 1000);
        if (this.props.game.id === undefined) {
            content = React.createElement(
                'div',
                { className: 'alert alert-info' },
                'The next lottery has not been created yet. Check back later.'
            );
        } else if (this.props.game.id === 0) {
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
                                    content = React.createElement(
                                        'div',
                                        { className: 'alert alert-info' },
                                        'Your tailgate tag has been picked up. Enjoy the game!'
                                    );
                                } else if (this.props.game.pickup_deadline < timestamp) {
                                    content = React.createElement(
                                        'div',
                                        { className: 'alert alert-info' },
                                        'Sorry, you failed to pick up your tailgating pass in time. It has been forfeited.'
                                    );
                                } else {
                                    content = React.createElement(
                                        'div',
                                        { className: 'alert alert-info' },
                                        'You have chosen lot ',
                                        React.createElement(
                                            'strong',
                                            null,
                                            this.props.spot.title
                                        ),
                                        ', spot number ',
                                        React.createElement(
                                            'strong',
                                            null,
                                            this.props.spot.number
                                        ),
                                        '. Make sure to go pick up your tag before the ',
                                        this.props.game.pickup_deadline_format,
                                        ' deadline.',
                                        React.createElement('br', null),
                                        'See the ',
                                        React.createElement(
                                            'a',
                                            { href: './' },
                                            'home page'
                                        ),
                                        ' for more details.'
                                    );
                                }
                            } else {
                                if (this.props.game.pickup_deadline < timestamp) {
                                    content = React.createElement(
                                        'div',
                                        { className: 'alert alert-info' },
                                        'Sorry, you failed to confirm your tailgating win. Your spot has been forfeited.'
                                    );
                                } else {
                                    content = React.createElement(
                                        'div',
                                        null,
                                        React.createElement(ConfirmSpot, { lottery: this.props.lottery, loadData: this.props.loadData })
                                    );
                                }
                            }
                        } else {
                            // current student has not confirmed their spot
                            content = React.createElement(
                                'div',
                                { className: 'alert alert-success' },
                                React.createElement(
                                    'strong',
                                    null,
                                    'Congratulations,'
                                ),
                                ' you won a lottery spot! Check your email to confirm your win.'
                            );
                        }
                    } else {
                        // student submitted but did not win
                        content = React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            'Sorry, you did not win a spot this time. Try again next game.'
                        );
                    }
                } else {
                    // student did not submit a ticket for current lottery
                    content = React.createElement(
                        'div',
                        { className: 'alert alert-danger' },
                        'The lottery is complete and the winners have been contacted. Please, try again next game.'
                    );
                }
            } else {
                // lottery has not been run yet
                if (timestamp >= this.props.game.signup_end) {
                    // signup time is over
                    if (this.props.lottery) {
                        // the student submitted a ticket
                        content = React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            'Your application has been submitted. Watch your email and check back later for lottery results.'
                        );
                    } else {
                        // the student didn't submit a ticket.
                        content = React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            'Sorry, you missed the lottery sign up deadline. Try again next game.'
                        );
                    }
                } else if (this.props.game.signup_start <= timestamp) {
                    // the sign up start has passed.
                    if (this.props.lottery) {
                        // the student submitted a ticket.
                        content = React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            'Your application has been submitted. Check your email after ',
                            this.props.game.signup_end_format,
                            ' for lottery results.'
                        );
                    } else {
                        // the student hasn't submitted a ticket, show them the form
                        content = React.createElement(LotterySubmit, { game: this.props.game, handleClick: this.submitLottery });
                    }
                } else {
                    // the lottery signup has not yet begun
                    content = React.createElement(
                        'div',
                        { className: 'alert alert-success' },
                        'Tailgate lottery for this game begins at ',
                        React.createElement(
                            'strong',
                            null,
                            this.props.game.signup_start_format
                        ),
                        '. See you then!'
                    );
                }
            }
        }
        return content;
    }
});

var ConfirmSpot = React.createClass({
    displayName: 'ConfirmSpot',

    getInitialState: function () {
        return {
            availableSpots: [],
            message: null,
            waiting: 0
        };
    },

    getDefaultProps: function () {
        return {
            lottery: {}
        };
    },

    componentDidMount: function () {
        this.loadAvailableSpots();
    },

    loadAvailableSpots: function () {
        $.getJSON('tailgate/User/Lottery', {
            command: 'spotChoice'
        }).done(function (data) {
            this.setState({
                availableSpots: data
            });
        }.bind(this));
    },

    confirmSpot: function () {
        var spotId = this.refs.spotChoice.value;
        if (spotId === '0') {
            return;
        }
        var lotteryId = this.props.lottery.id;
        this.setState({
            waiting: 1
        });
        $.post('tailgate/User/Lottery', {
            command: 'pickSpot',
            spotId: spotId,
            lotteryId: lotteryId
        }, null, 'json').done(function (data) {
            if (data.success) {
                this.props.loadData();
            } else {
                this.setState({
                    waiting: 0
                });
                this.setState({
                    message: React.createElement(
                        'div',
                        { className: 'alert alert-danger' },
                        'Your requested spot was chosen by someone else. Pick again.'
                    )
                });
                this.loadAvailableSpots();
            }
        }.bind(this));
    },

    render: function () {
        var sober;
        if (this.state.waiting === 1) {
            return React.createElement(Waiting, null);
        }
        if (this.state.availableSpots.length > 0) {
            var options = this.state.availableSpots.map(function (val, i) {
                if (val.sober === '1') {
                    sober = '(Non-alcoholic)';
                } else {
                    sober = '';
                }
                return React.createElement(
                    'option',
                    { key: i, value: val.id },
                    val.lot_title + ', #' + val.number + ' ' + sober
                );
            });
            return React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-sm-12' },
                    React.createElement(
                        'p',
                        null,
                        'You have confirmed your winning ticket. Pick the spot you wish to tailgate in below. Choose quickly, other winners may be picking spots while you decide.'
                    ),
                    this.state.message
                ),
                React.createElement(
                    'div',
                    { className: 'col-sm-4' },
                    React.createElement(
                        'select',
                        { ref: 'spotChoice', className: 'form-control' },
                        React.createElement(
                            'option',
                            { disabled: true, selected: true, value: '0' },
                            '- Choose below -'
                        ),
                        options
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'col-sm-4' },
                    React.createElement(
                        'button',
                        { className: 'btn btn-primary', onClick: this.confirmSpot },
                        'Confirm my tailgating spot'
                    )
                )
            );
        } else {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'p',
                    null,
                    'We have run out of spots. Contact the site administrator.'
                )
            );
        }
    }
});

var LotterySubmit = React.createClass({
    displayName: 'LotterySubmit',

    render: function () {
        var game = this.props.game;
        return React.createElement(
            'div',
            null,
            React.createElement(
                'p',
                null,
                'Lottery submission deadline: ',
                game.signup_end_format
            ),
            React.createElement(
                'p',
                { style: { marginTop: '1em' } },
                React.createElement(
                    'button',
                    { className: 'btn btn-primary btn-lg', onClick: this.props.handleClick },
                    React.createElement('i', { className: 'fa fa-check-square' }),
                    ' Submit my name to the tailgate lottery'
                )
            ),
            React.createElement(
                'p',
                null,
                React.createElement(
                    'small',
                    null,
                    React.createElement(
                        'em',
                        null,
                        'Lottery winners will choose their spot on a first come, first serve basis.'
                    )
                )
            )
        );
    }
});

var Waiting = React.createClass({
    displayName: 'Waiting',

    render: function () {
        return React.createElement(
            'div',
            { className: 'alert alert-success' },
            React.createElement('i', { className: 'fa fa-cog fa-spin fa-lg' }),
            ' Please wait...'
        );
    }
});

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
ReactDOM.render(React.createElement(Status, null), document.getElementById('studentStatus'));
