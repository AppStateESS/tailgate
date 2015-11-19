var limitDefault = 50;

var tgMixin = {
    showForm : function() {
        this.setState({
            showForm : true
        });
    },

    hideForm : function() {
        this.setState({
            showForm : false
        });
    },

    loadVisitors: function() {
        $.getJSON('tailgate/Admin/Visitor', {
            command : 'list'
        }).done(function(data){
            if (data.length < 1) {
                data = [];
            }
            if (this.isMounted()) {
                    this.setState({
                    visitors : data
                });
            }
        }.bind(this));
    },

    getUnixTime : function(date){
        var obj = new Date(date).getTime() / 1000;
        return obj;
    }

};

var datepickerMixin =  {
    dateInit : function(domId, useTime) {
        var dateFormat = useTime ? 'Y/m/d H:i' : 'Y/m/d';
        $(domId).datetimepicker({
            timepicker:useTime,
            format: dateFormat,
            onChangeDateTime : function(ct, i) {
                this.update(ct);
            }.bind(this),
        });
    },

    popupCalendar : function(domId) {
        $(domId).datetimepicker('show');
    },

    updateDate: function(command, date) {
        $.post('tailgate/Admin/Game', {
            command: command,
            date: date
        }, null, 'json')
            .done(function(data) {
                if (data.success) {
                    this.props.update();
                } else {
                    this.props.error(data.error);
                }
            }.bind(this));
    },
}

var Setup = React.createClass({displayName: "Setup",
    mixins: [React.addons.PureRenderMixin],

    getInitialState: function() {
        return {
            currentTab : 'games',
            currentGame : {},
            lots : []
        };
    },

    componentDidMount: function() {
        this.loadGame();
        this.loadLots();
    },

    loadGame : function() {
        var xhr = $.getJSON('tailgate/Admin/Game', {
            command : 'getCurrent'
        });
        xhr.done(function(data){
            this.setState({
                currentGame : data
            });
        }.bind(this));
        return xhr;
    },

    loadLots: function() {
        $.getJSON('tailgate/Admin/Lot', {
            command : 'list'
        }).done(function(data){
            if (data.length < 1) {
                data = [];
            }

            this.setState({
                lots : data
            });

        }.bind(this));
    },

    changeTab : function(e) {
        this.setState({
            currentTab : e
        });
    },

    startLottery : function() {
        this.changeTab('lottery');
    },

    render : function() {
        var pageContent;
        var canAdd = false;
        if (this.state.currentGame && this.state.currentGame.id !== undefined) {
            canAdd = true;
        }
        switch(this.state.currentTab) {
            case 'games':
            pageContent = React.createElement(Games, {startLottery: this.startLottery, lots: this.state.lots, loadLots: this.loadLots, update: this.updateGame, loadGame: this.loadGame, game: this.state.currentGame});
            break;

            case 'lottery':
            pageContent = React.createElement(RunLottery, {currentGame: this.state.currentGame, loadGame: this.loadGame});
            break;

            case 'visitors':
            pageContent = React.createElement(Visitors, {game: this.state.currentGame});
            break;

            case 'lots':
            pageContent = React.createElement(Lots, {lots: this.state.lots, loadLots: this.loadLots, game: this.state.currentGame});
            break;

            case 'students':
            pageContent = React.createElement(Students, {canAdd: canAdd, game: this.state.currentGame});
            break;

            case 'settings':
            pageContent = React.createElement(Settings, {replyTo: this.state.replyTo, newStudent: this.state.newStudent});
            break;
        }
        return (
            React.createElement("div", null, 
                React.createElement("ul", {className: "nav nav-tabs"}, 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'games' || this.state.currentTab === 'lottery' ? 'active' : '', onClick: this.changeTab.bind(null, 'games')}, React.createElement("a", {style: {cursor:'pointer'}}, "Games")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'visitors' ? 'active' : '', onClick: this.changeTab.bind(null, 'visitors')}, React.createElement("a", {style: {cursor:'pointer'}}, "Visitors")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'lots' ? 'active' : '', onClick: this.changeTab.bind(null, 'lots')}, React.createElement("a", {style: {cursor:'pointer'}}, "Lots")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'students' ? 'active' : '', onClick: this.changeTab.bind(null, 'students')}, React.createElement("a", {style: {cursor:'pointer'}}, "Students")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'settings' ? 'active' : '', onClick: this.changeTab.bind(null, 'settings')}, React.createElement("a", {style: {cursor:'pointer'}}, "Settings"))
                ), 
                React.createElement("hr", null), 
                pageContent, 
                React.createElement(Modal, null)
            )
        );
    }
});

/**
 * Switching the tab to this lottery starts it up.
 */
var RunLottery = React.createClass({displayName: "RunLottery",
    getInitialState: function() {
        return {
            spotsLeft : 0,
            messageLog : ''
        };
    },


    getTotalSpots : function() {
        var xhr = $.getJSON('tailgate/Admin/Lottery', {
            command : 'getAvailableSpots'
        });
        return xhr;
    },

    concatMessage : function(messageAdd)
    {
        var message = this.state.messageLog;
        this.setState({
            messageLog : message + "\n" + messageAdd
        });
    },

    chooseWinners : function() {
        var xhr = $.post('tailgate/Admin/Lottery', {
            command : 'chooseWinners'
        },function(){}, 'json');
        return xhr;
    },

    closeLottery : function() {
        var xhr = $.post('tailgate/Admin/Lottery', {
            command : 'completeLottery'
        });
        return xhr;
    },

    notifyWinners : function() {
        var xhr = $.post('tailgate/Admin/Lottery', {
            command : 'notify'
        }, null, 'json');
        return xhr;
    },

    componentDidMount: function() {
        var currentGame = this.props.currentGame;
        if (currentGame.lottery_run === '1') {
            this.concatMessage('This lottery has already been run.');
            return;
        }
        this.concatMessage('Starting lottery. Do not refresh or leave page.');
        this.concatMessage('Checking number of available spots.');
        var totalSpotsXHR = this.getTotalSpots();
        totalSpotsXHR.done(function(data){
            var totalSpots = data.available_spots;
            this.concatMessage(totalSpots + ' spots are available.');
            this.setState({
                spotsLeft : totalSpots,
            });

            this.concatMessage('Assigning winners.');
            var winnersXHR = this.chooseWinners();
            winnersXHR.done(function(data){
                this.concatMessage(data.spots_filled + ' spots filled.');
                this.concatMessage(data.spots_left + ' spots left.');
                this.setState({
                    spotsLeft : data.spots_left
                });

                if (data.spots_filled === '0') {
                    this.concatMessage('Finished. Closing lottery.');
                    var closeXHR = this.closeLottery();
                    closeXHR.done(function(data){
                        this.props.loadGame();
                    }.bind(this));
                } else {
                    this.concatMessage('Notifying winners and losers.');
                    var notifyXHR = this.notifyWinners();
                    notifyXHR.done(function(data){
                        this.concatMessage('Finished. Closing lottery.');
                        var closeXHR = this.closeLottery();
                        closeXHR.done(function(data){
                            this.props.loadGame();
                        }.bind(this));
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    },

    render : function() {
        return (
            React.createElement("div", null, 
                React.createElement("h4", null, "Running lottery for ", this.props.currentGame.university, " ", this.props.currentGame.mascot, " - ", this.props.currentGame.kickoff_format), 
                React.createElement("div", null, React.createElement("pre", {style: {height : '300px', width : '100%'}}, this.state.messageLog))
            )
        );
    }
});


var Games = React.createClass({displayName: "Games",
    mixins: [tgMixin],

    getInitialState: function() {
        return {
            visitors : [],
            availableSpots : 0,
            submissions : 0,
            message : ''
        };
    },

    loadGames : function() {
        this.props.loadGame();
        $.getJSON('tailgate/Admin/Game', {
            command : 'list'
        }).done(function(data){
            this.setState({
                availableSpots : data.available_spots
            });
        }.bind(this));
    },


    completeGame : function()
    {
        $.post('tailgate/Admin/Game', {
            command : 'complete',
            id : this.props.game.id
        }, null, 'json').done(function(data){
            this.loadGames();
        }.bind(this));
    },

    loadSubmissions : function() {
        $.getJSON('tailgate/Admin/Lottery', {
            command : 'submissionCount'
        }).done(function(data){
            this.setState({
                submissions:data.submissions
            });
        }.bind(this));
    },

    componentDidMount : function() {
        this.loadVisitors();
        this.loadGames();
        this.loadSubmissions();
        if (this.isMounted()) {
            $('#signup-start').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#signup-end').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#pickup-deadline').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#kickoff').datetimepicker({
                timepicker:false,
                format: 'n/j/Y'
            });
        }
    },

    saveGame : function() {
        var visitor_id = $('#pick-team').val();
        var kickoff = this.getUnixTime($('#kickoff').val());
        var startSignup = new Date($('#signup-start').val()).getTime() / 1000;
        var endSignup = new Date($('#signup-end').val()).getTime() / 1000;
        var pickupDeadline = new Date($('#pickup-deadline').val()).getTime() / 1000;

        if ((startSignup < endSignup)) {
            if (endSignup < pickupDeadline) {
                if (pickupDeadline < kickoff) {
                    $.post('tailgate/Admin/Game', {
                        command : 'add',
                        visitor_id : visitor_id,
                        kickoff : kickoff,
                        signup_start : startSignup,
                        signup_end : endSignup,
                        pickup_deadline : pickupDeadline
                    }).done(function(){
                        this.loadGames();
                        this.props.loadLots();
                        this.setState({
                            message : ''
                        });
                    }.bind(this));
                } else {
                    this.setState({
                        message : 'Pickup date must be less than game date'
                    });
                }
            } else {
                this.setState({
                    message : 'Signup deadline must be less than pickup date'
                });
            }
        } else {
            this.setState({
                message : 'Signup start must be less than signup deadline'
            });
        }
    },

    render : function() {
        var previousGames = null;
        var currentGame = null;
        var message = null;
        var title = 'Current game';

        if (this.state.message.length > 0) {
            message = React.createElement("div", {className: "alert alert-danger"}, this.state.message);
        }

        if (this.props.game === null) {
            title = 'Add new game';
            if(this.state.visitors.length === 0) {
                currentGame = React.createElement("div", null, React.createElement("p", null, "Create some visitors first."));
            } else if(this.props.lots.length === 0) {
                currentGame = React.createElement("div", null, React.createElement("p", null, "Create some tailgate lots first."));
            } else {
                currentGame = React.createElement(GameForm, {visitors: this.state.visitors, save: this.saveGame});
            }
        } else if (Object.keys(this.props.game).length > 0) {
            currentGame = React.createElement(GameInfo, {game: this.props.game, startLottery: this.props.startLottery, submissions: this.state.submissions, loadGame: this.props.loadGame, completeGame: this.completeGame, availableSpots: this.state.availableSpots});
        } else {
            currentGame = null;
        }

        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "well"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-sm-12"}, 
                            React.createElement("h3", null, title), 
                            message
                        )
                    ), 
                    currentGame
                )
            )
        );
    }
});


var GameInfo = React.createClass({displayName: "GameInfo",

    getInitialState: function() {
        return {
            message : null,
            allowEdit: true
        };
    },

    getDefaultProps : function() {
        return {
            game : null,
            startLottery : null, // function to start the lottery
            submissions : 0,
            loadGame : null, // function to reload the game Object
            availableSpots : 0
        };
    },

    componentDidMount : function() {
        this.initializeDateTime();
    },

    initializeDateTime : function() {
        game = this.props.game;
        if (game.lottery_run == '0' || this.state.allowEdit) {
            $('#signup-start').datetimepicker({
                value : game.signup_start_ts,
                maxDate : game.signup_end_ts.substr(0, 10)
            });

            $('#signup-end').datetimepicker({
                value : game.signup_end_ts,
                minDate : game.signup_start_ts.substr(0, 10),
                maxDate : game.pickup_deadline_ts.substr(0, 10)
            });

            $('#pickup-deadline').datetimepicker({
                value : game.pickup_deadline_ts,
                minDate : game.signup_end_ts.substr(0, 10),
                maxDate : game.kickoff_ts
            });

            $('#kickoff').datetimepicker({
                value : game.kickoff_ts,
                minDate : game.pickup_deadline_ts.substr(0, 10)
            });
        }
    },

    setError: function(error) {
        this.setState({
            message : React.createElement("div", {className: "alert alert-danger"}, error)
        });
    },

    update : function(){
        this.setState({
            message : null
        });
        var xhr = this.props.loadGame();
        xhr.always(function() {
            this.initializeDateTime()
        }.bind(this));
    },

    render: function() {
        var button = null;
        var message = null;
        var timestamp = Math.floor(Date.now() / 1000);
        var pickupReport = null;
        var winnerReport = null;
        var spotReport =null;

        if (this.props.game.lottery_run === '1' && this.props.game.pickup_deadline < timestamp) {
            pickupReport = (
                React.createElement("div", {className: "pull-left", style: {marginRight : '.5em'}}, 
                    React.createElement("a", {href: "./tailgate/Admin/Report/?command=pickup", target: "_blank", className: "btn btn-primary btn-sm"}, 
                        React.createElement("i", {className: "fa fa-file-text-o"}), " Pickup report"
                    )
                )
            );

            spotReport = (
                React.createElement("div", null, 
                    React.createElement("a", {href: "./tailgate/Admin/Report/?command=spotReport", target: "_blank", className: "btn btn-primary btn-sm"}, 
                        React.createElement("i", {className: "fa fa-file-text-o"}), " Spot report"
                    )
                )
            );
        }

        if (this.props.game.lottery_run === '1') {
            winnerReport = (
                React.createElement("div", {className: "pull-left", style: {marginRight : '.5em'}}, 
                    React.createElement("a", {href: "./tailgate/Admin/Report/?command=winners", target: "_blank", className: "btn btn-primary btn-sm"}, 
                        React.createElement("i", {className: "fa fa-file-text-o"}), " Winner list"
                    )
                )
            );
        }

        if (this.props.game.lottery_run == '0') {
            button = React.createElement(LotteryRun, {game: this.props.game, startLottery: this.props.startLottery});
        } else if (this.props.game.kickoff < Math.floor(Date.now() / 1000)) {
            button = React.createElement("button", {className: "btn btn-primary", onClick: this.props.completeGame}, "Complete lottery");
        }

        return (
            React.createElement("div", null, 
                React.createElement("h4", null, this.props.game.university, " ", this.props.game.mascot, " - Total submissions: ", this.props.submissions, ", Unreserved, available spots: ", this.props.availableSpots), 
                this.state.message, 
                React.createElement("div", {className: "row"}, 
                    React.createElement(SignupStart, {allowEdit: this.state.allowEdit, timestamp: timestamp, error: this.setError, update: this.update, game: this.props.game}), 
                    React.createElement(SignupEnd, {allowEdit: this.state.allowEdit, timestamp: timestamp, error: this.setError, update: this.update, game: this.props.game}), 
                    React.createElement(PickupDeadline, {allowEdit: this.state.allowEdit, timestamp: timestamp, error: this.setError, update: this.update, game: this.props.game}), 
                    React.createElement(Kickoff, {allowEdit: this.state.allowEdit, timestamp: timestamp, error: this.setError, update: this.update, game: this.props.game})
                ), 
                winnerReport, 
                pickupReport, 
                spotReport, 
                React.createElement("div", {style: {marginTop: '.5em',clear:'both'}}, 
                    button
                )
            )
        );
    }

});

var SignupStart = React.createClass({displayName: "SignupStart",
    mixins: [datepickerMixin],

    getDefaultProps: function() {
        return {
            game : null,
            loadGame : null,
            allowEdit : true
        };
    },

    componentDidMount: function() {
        this.dateInit('#signup-start', true);
    },

    update: function(date) {
        this.updateDate('updateSignupStart', date);
    },

    render: function() {
        var button = null;
        var game = this.props.game;
        var timestamp = this.props.timestamp;
        var bgColor = game.signup_start > timestamp ? 'success' : 'info';
        if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
            button = React.createElement(EditDateButton, {buttonId: 'signup-start', 
                handleClick: this.popupCalendar.bind(this, '#signup-start')});
        } else {
            button = null;
        }

        return React.createElement(DatetimeBox, {bgColor: bgColor, button: button, title: 'Signup start', date: this.props.game.signup_start_format})
    }
});

var SignupEnd = React.createClass({displayName: "SignupEnd",
    mixins: [datepickerMixin],

    getDefaultProps: function() {
        return {
            game : null,
            loadGame : null,
            allowEdit : true
        };
    },

    componentDidMount: function() {
        this.dateInit('#signup-end', true);
    },

    update: function(date) {
        this.updateDate('updateSignupEnd', date);
    },

    render: function() {
        var button = null;
        var game = this.props.game;
        var timestamp = this.props.timestamp;
        var bgColor = timestamp < game.signup_end && timestamp > game.signup_start ? 'success' : 'info';
        if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
            button = React.createElement(EditDateButton, {buttonId: 'signup-end', 
                handleClick: this.popupCalendar.bind(this, '#signup-end')});
        } else {
            button = null;
        }

        return React.createElement(DatetimeBox, {bgColor: bgColor, button: button, title: 'Signup end', 
             date: this.props.game.signup_end_format})
    }
});

var PickupDeadline = React.createClass({displayName: "PickupDeadline",
    mixins: [datepickerMixin],

    getDefaultProps: function() {
        return {
            game : null,
            loadGame : null,
            allowEdit : true
        };
    },

    componentDidMount: function() {
        this.dateInit('#pickup-deadline', true);
    },

    update: function(date) {
        this.updateDate('updatePickupDeadline', date);
    },

    render: function() {
        var button = null;
        var game = this.props.game;
        var timestamp = this.props.timestamp;
        var bgColor = timestamp < game.pickup_deadline && timestamp > game.signup_end ? 'success' : 'info';
        if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
            button = React.createElement(EditDateButton, {buttonId: 'pickup-deadline', 
                handleClick: this.popupCalendar.bind(this, '#pickup-deadline')});
        } else {
            button = null;
        }

        return React.createElement(DatetimeBox, {bgColor: bgColor, button: button, title: 'Pickup Deadline', 
             date: this.props.game.pickup_deadline_format})
    }
});

var Kickoff = React.createClass({displayName: "Kickoff",
    mixins: [datepickerMixin],

    getDefaultProps: function() {
        return {
            game : null,
            loadGame : null,
            allowEdit : true
        };
    },

    componentDidMount: function() {
        this.dateInit('#kickoff', false);
    },

    update: function(date) {
        this.updateDate('updateKickoff', date);
    },

    render: function() {
        var button = null;
        var game = this.props.game;
        var timestamp = this.props.timestamp;
        var bgColor = timestamp < game.kickoff && timestamp > game.pickup_deadline ? 'success' : 'info';
        if (this.props.game.lottery_run == '0' || this.props.allowEdit) {
            button = React.createElement(EditDateButton, {buttonId: 'kickoff', 
                handleClick: this.popupCalendar.bind(this, '#kickoff')});
        } else {
            button = null;
        }

        return React.createElement(DatetimeBox, {bgColor: bgColor, button: button, title: 'Kickoff', 
             date: this.props.game.kickoff_format})
    }
});

DatetimeBox = (props) => (
    React.createElement("div", {className: "col-sm-3"}, 
        React.createElement("div", {className: 'alert alert-' + props.bgColor}, 
            props.button, 
            React.createElement("big", null, React.createElement("strong", null, props.title)), React.createElement("br", null), 
            props.date
        )
    )
);

var EditDateButton = React.createClass({displayName: "EditDateButton",

    getDefaultProps : function() {
        return {
            buttonId : null,
            handleClick : null
        };
    },

    render: function() {
        return (
            React.createElement("button", {className: "pull-right btn btn-sm btn-primary", id: this.props.buttonId, onClick: this.props.handleClick}, "Edit")
        );
    }
});

var LotteryRun = React.createClass({displayName: "LotteryRun",
    getInitialState: function() {
        return {
            start : false
        };
    },

    confirmLottery : function() {
        this.setState({
            start : true
        });
    },

    stopLottery : function() {
        this.setState({
            start : false
        });
    },

    render : function() {
        var button = null;
        var ctime = Date.now() / 1000;
        var currentTime = Math.floor(ctime);
        if (this.props.game.signup_end < currentTime) {
            if (this.state.start) {
                button = (
                    React.createElement("div", null, 
                        React.createElement("p", null, "Are you sure you want to start the lottery?"), 
                        React.createElement("button", {style: {marginRight : '1em'}, className: "btn btn-success btn-lg", onClick: this.props.startLottery}, 
                            React.createElement("i", {className: "fa fa-check"}), " Confirm: Start lottery"), 
                        React.createElement("button", {className: "btn btn-danger btn-lg", onClick: this.stopLottery}, 
                            React.createElement("i", {className: "fa fa-times"}), " Cancel running lottery")
                    )
                );
            } else {
                button = React.createElement("button", {className: "btn btn-success btn-lg", onClick: this.confirmLottery}, "Start lottery");
            }
        }
        return (
            React.createElement("div", {className: "text-center"}, button)
        );
    }
});

var GameForm = React.createClass({displayName: "GameForm",
    componentDidMount: function() {
        if (this.isMounted()) {
            $('#signup-start').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#signup-end').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#pickup-deadline').datetimepicker({
                timepicker:true,
                format: 'n/j/Y H:i'
            });

            $('#kickoff').datetimepicker({
                timepicker:false,
                format: 'n/j/Y'
            });
        }
    },

    render : function() {
        var date = new Date();
        var month = (date.getMonth() + 1);
        var dateString = month + '/' + date.getDate() +  '/' + date.getFullYear();
        var hours = date.getHours().toString();
        var datetimeString = dateString + ' ' + hours + ':00';
        var options = this.props.visitors.map(function(value, i){
            return (
                React.createElement("option", {key: i, value: value.id}, value.university, " - ", value.mascot)
            );
        }.bind(this));
        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-sm-6"}, 
                        React.createElement("label", {htmlFor: "pick-team"}, "Pick visiting team"), 
                        React.createElement("select", {id: "pick-team", className: "form-control"}, 
                            options
                        )
                    ), 
                    React.createElement("div", {className: "col-sm-6"}, 
                        React.createElement(TextInput, {inputId: 'kickoff', label: "Game date", ref: "date", defaultValue: dateString})
                    )
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-sm-4"}, 
                        React.createElement(TextInput, {inputId: 'signup-start', label: "Signup start", ref: "date", defaultValue: datetimeString})
                    ), 
                    React.createElement("div", {className: "col-sm-4"}, 
                        React.createElement(TextInput, {inputId: 'signup-end', label: "Signup deadline", ref: "date", defaultValue: datetimeString})
                    ), 
                    React.createElement("div", {className: "col-sm-4"}, 
                        React.createElement(TextInput, {inputId: 'pickup-deadline', label: "Pickup deadline", ref: "date", defaultValue: datetimeString})
                    )
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-sm-12 text-center"}, 
                        React.createElement("button", {className: "btn btn-success", onClick: this.props.save}, React.createElement("i", {className: "fa fa-save"}), " Save game")
                    )
                )
            )
        );
    }
});

var Visitors = React.createClass({displayName: "Visitors",
    mixins: [tgMixin],

    getInitialState: function() {
        return {
            visitors : [],
            showForm : false
        };
    },

    componentDidMount: function() {
        this.loadVisitors();
    },

    removeVisitor : function(index) {
        var visitor = this.state.visitors[index];
        $.post('tailgate/Admin/Visitor', {
            command : 'deactivate',
            visitor_id: visitor.id
        }, null, 'json')
        .done(function(){
            this.loadVisitors();
        }.bind(this))
        .fail(function(jse){
        });
    },

    editVisitor : function(index) {
        var visitor = this.state.visitors[index];
    },

    render : function() {
        var visitorForm;
        var deleteButton;
        if (this.state.showForm) {
            visitorForm = React.createElement(VisitorForm, {closeForm: this.hideForm, loadVisitors: this.loadVisitors});
        } else {
            visitorForm = null;
        }

        return (
            React.createElement("div", null, 
                React.createElement("p", null, React.createElement("button", {className: "btn btn-success", onClick: this.showForm}, React.createElement("i", {className: "fa fa-plus"}), " Add Team")), 
                visitorForm, 
                React.createElement("table", {className: "table table-striped"}, 
                    React.createElement("tbody", null, 
                        this.state.visitors.map(function(value, i){
                            var removeClick = this.removeVisitor.bind(this,i);
                            var editClick = this.editVisitor.bind(this,i);
                            return (
                                React.createElement(VisitorRow, {key: i, game: this.props.game, value: value, update: this.loadVisitors})
                            );
                        }, this)
                    )
                )
            )
        );
    }
});

var VisitorRow = React.createClass({displayName: "VisitorRow",
    getInitialState: function() {
        return {
            showForm : false
        };
    },

    edit : function() {
        this.setState({
            showForm : true
        });
    },

    view : function() {
        this.setState({
            showForm : false
        });
        this.props.update();
    },

    render : function() {
        var rowContent = null;
        var editButton = null;

        if (this.state.showForm) {
            rowContent = React.createElement(VisitorRowForm, {value: this.props.value, update: this.view});
            editButton = null;
        } else {
            rowContent = React.createElement("div", null, this.props.value.university, " - ", this.props.value.mascot);
            editButton = React.createElement(VisitorRowEditButton, {handleClick: this.edit});
        }

        return (
            React.createElement("tr", null, 
                React.createElement("td", null, 
                    editButton, 
                    this.props.game && this.props.game.visitor_id !== this.props.value.id ? React.createElement(VisitorRowDeleteButton, {handleClick: this.props.remove})  : null, 
                    rowContent
                )
            )
        );
    }
});


var VisitorRowEditButton = React.createClass({displayName: "VisitorRowEditButton",
    render: function() {
        return (
            React.createElement("button", {style: {marginRight : '.5em'}, className: "btn btn-sm btn-primary pull-right", onClick: this.props.handleClick}, React.createElement("i", {className: "fa fa-edit"}), " Edit")
        );
    }
});

var VisitorRowDeleteButton = React.createClass({displayName: "VisitorRowDeleteButton",
    render: function() {
        return (
            React.createElement("button", {style: {marginRight : '.5em'}, className: "btn btn-sm btn-danger pull-right", onClick: this.props.handleClick}, React.createElement("i", {className: "fa fa-times"}), " Remove")
        );
    }
});

var VisitorRowForm = React.createClass({displayName: "VisitorRowForm",
    getInitialState: function() {
        return {
            university : null,
            mascot : null
        };
    },

    componentDidMount : function() {
        this.setState({
            university : this.props.value.university,
            mascot : this.props.value.mascot
        });
    },


    updateUniversity : function(event)
    {
        this.setState({
            university : event.target.value
        });
    },

    updateMascot : function(event)
    {
        this.setState({
            mascot : event.target.value
        });
    },

    update : function() {
        if (this.state.university.length === 0) {
            this.setState({university : this.props.value.university});
            return;
        }
        if (this.state.mascot.length === 0) {
            this.setState({mascot : this.props.value.mascot});
            return;
        }
        $.post('tailgate/Admin/Visitor', {
            command : 'update',
            university : this.state.university,
            mascot : this.state.mascot,
            visitorId : this.props.value.id
        }).done(function(){
            this.props.update();
        }.bind(this));
    },


    render : function() {
        return (
            React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-4"}, 
                    React.createElement("input", {ref: "university", type: "text", className: "form-control", defaultValue: this.props.value.university, value: this.state.university, onChange: this.updateUniversity})
                ), 
                React.createElement("div", {className: "col-sm-4"}, 
                    React.createElement("input", {ref: "mascot", type: "text", className: "form-control", defaultValue: this.props.value.mascot, value: this.state.mascot, onChange: this.updateMascot})
                ), 
                React.createElement("div", {className: "col-sm-2"}, 
                    React.createElement("button", {className: "btn btn-primary btn-sm", onClick: this.update}, React.createElement("i", {className: "fa fa-save"}), " Update")
                )
            )
        );
    }
});

var VisitorForm = React.createClass({displayName: "VisitorForm",
    getInitialState : function() {
        return {
            message : ''
        };
    },

    save : function() {
        var university = $('#university').val();
        var mascot = $('#mascot').val();

        if (university.length > 0 && mascot.length > 0) {
            $.post('tailgate/Admin/Visitor', {
                command : 'add',
                university: university,
                mascot : mascot
            })
            .done(function(){
                this.props.closeForm();
                this.props.loadVisitors();
            }.bind(this))
            .fail(function(){
                var error_message = React.createElement(Alert, {message: 'Error: Check your university and mascot inputs for correct information'});
                this.setState({
                    message : error_message
                });
            }.bind(this));
        }
    },

    render : function() {
        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "row well"}, 
                    this.state.message, 
                    React.createElement("div", {className: "form-group col-sm-6"}, 
                        React.createElement(TextInput, {label: 'University:', inputId: 'university'})
                    ), 
                    React.createElement("div", {className: "form-group col-sm-6"}, 
                        React.createElement(TextInput, {label: 'Mascot:', inputId: 'mascot'})
                    ), 
                    React.createElement("div", {className: "col-sm-12 text-center"}, 
                        React.createElement("button", {className: "btn btn-primary", onClick: this.save}, React.createElement("i", {className: "fa fa-save"}), " Save"), " ", 
                        React.createElement("button", {className: "btn btn-default", onClick: this.props.closeForm}, React.createElement("i", {className: "fa fa-times"}), " Close")
                    )
                )
            )
        );
    }
});

var Lots = React.createClass({displayName: "Lots",
    mixins: [tgMixin],

    getInitialState : function() {
        return {
            showForm: false
        };
    },

    render : function() {
        var lotForm;
        if (this.state.showForm) {
            lotForm = React.createElement(LotForm, {closeForm: this.hideForm, loadLots: this.props.loadLots});
        } else {
            lotForm = null;
        }
        return (
            React.createElement("div", null, 
                React.createElement("p", null, React.createElement("button", {className: "btn btn-success", onClick: this.showForm}, React.createElement("i", {className: "fa fa-plus"}), " Add Tailgating Lot")), 
                lotForm, 
                React.createElement(LotListing, {lots: this.props.lots, loadLots: this.props.loadLots, game: this.props.game})
            )
        );
    }
});

var LotListing = React.createClass({displayName: "LotListing",

    getDefaultProps : function() {
        return {
            lots : []
        };
    },

    getInitialState: function() {
        return {
            spotKey : -1
        };
    },

    resetSpots : function() {
        this.setState({
            spotKey : -1
        });
    },

    manageSpots : function(key, e) {
        if (this.state.spotKey === key) {
            key = -1;
        }
        this.setState({
            spotKey : key
        });
    },

    deactivate : function(key, e) {
        $.post('tailgate/Admin/Lot', {
            command : 'deactivate',
            lotId : this.props.lots[key].id
        }).done(function(data){
            this.props.loadLots();
        }.bind(this));
    },

    activate : function(key, e) {
        $.post('tailgate/Admin/Lot', {
            command : 'activate',
            lotId : this.props.lots[key].id
        }).done(function(data){
            this.props.loadLots();
        }.bind(this));
    },

    delete : function(key, e) {
        if (prompt('Type Y-E-S if you are sure you want to permanently delete this lot') === 'YES') {
            $.post('tailgate/Admin/Lot', {
                command : 'delete',
                lotId : this.props.lots[key].id
            }).done(function(data){
                this.props.loadLots();
            }.bind(this));
        }
    },

    render : function() {
        var timestamp = Math.floor(Date.now() / 1000);
        var button = null;
        var allowExtraButtons = false;
        if (this.props.game === null || this.props.game.signup_start > timestamp) {
            allowExtraButtons = true;
        } else {
            allowExtraButtons = false;
        }
        return (
            React.createElement("div", null, 
                this.props.lots.map(function(value, i){
                    if (allowExtraButtons) {
                        if (value.active === '1') {
                            button = React.createElement("button", {style: {marginLeft : '.5em'}, className: "btn btn-danger btn-sm", 
                                onClick: this.deactivate.bind(this, i)}, "Deactivate");
                        } else {
                            button = React.createElement("span", null, 
                                React.createElement("button", {style: {marginLeft : '.5em'}, className: "btn btn-default btn-sm", onClick: this.activate.bind(this, i)}, "Activate"), 
                                React.createElement("button", {style: {marginLeft : '.5em'}, className: "btn btn-danger btn-sm", onClick: this.delete.bind(this, i)}, React.createElement("i", {className: "fa fa-trash-o"}), " Delete")
                                );
                        }
                    }
                    return (
                        React.createElement("div", {className: "panel panel-default", key: i}, 
                            React.createElement("div", {className: "panel-body row"}, 
                                React.createElement("div", {className: "col-sm-5"}, value.title), 
                                React.createElement("div", {className: "col-sm-3"}, React.createElement("strong", null, "Total spots:"), " ", value.total_spots), 
                                React.createElement("div", {className: "col-sm-4"}, 
                                    React.createElement("button", {className: "btn btn-primary btn-sm", onClick: this.manageSpots.bind(this, i)}, 
                                        "Manage Spots ", React.createElement("i", {className: this.state.spotKey === i ? 'fa fa-caret-up' : 'fa fa-caret-down'})
                                    ), 
                                    button
                                ), 
                                this.state.spotKey === i ? React.createElement(Spots, {lotId: value.id, close: this.resetSpots, game: this.props.game}) : null
                            )
                        )
                    );
                }.bind(this))
            )
        );
    }
});

var LotForm = React.createClass({displayName: "LotForm",
    getInitialState : function() {
        return {
            message : ''
        };
    },

    save : function() {
        var title = $('#lotTitle').val();
        var totalSpaces = +$('#totalSpaces').val();
        if (title.length > 0 && totalSpaces > 0) {
            $.post('tailgate/Admin/Lot', {
                command : 'add',
                title: title,
                default_spots : totalSpaces
            })
            .done(function(){
                this.props.closeForm();
                this.props.loadLots();
            }.bind(this))
            .fail(function(){
                var error_message = React.createElement(Alert, {message: 'Error: Check your lot name and total spaces for correct information'});
                this.setState({
                    message : error_message
                });
            }.bind(this));
        }

    },

    forceNumbers : function(e) {
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    },

    render : function() {
        return (
            React.createElement("div", null, 
                React.createElement("div", {className: "row well"}, 
                    this.state.message, 
                    React.createElement("div", {className: "form-group col-sm-6"}, 
                        React.createElement(TextInput, {label: 'Name of lot', inputId: 'lotTitle', required: true})
                    ), 
                    React.createElement("div", {className: "form-group col-sm-3"}, 
                        React.createElement(TextInput, {label: 'Total spaces:', inputId: 'totalSpaces', handlePress: this.forceNumbers, required: true})
                    ), 
                    React.createElement("div", {className: "col-sm-12 text-center"}, 
                        React.createElement("button", {className: "btn btn-primary", onClick: this.save}, React.createElement("i", {className: "fa fa-save"}), " Save"), " ", 
                        React.createElement("button", {className: "btn btn-default", onClick: this.props.closeForm}, React.createElement("i", {className: "fa fa-times"}), " Close")
                    )
                )
            )
        );
    }
});

var Spots = React.createClass({displayName: "Spots",
    getInitialState : function() {
        return {
            spots : []
        };
    },

    getDefaultProps : function() {
        return {
            lotId : 0
        };
    },

    componentDidMount: function() {
        this.loadSpots();
    },

    componentWillReceiveProps : function(newProps)
    {
        this.loadSpots();
    },

    loadSpots : function() {
        if (this.props.lotId === 0) {
            return;
        }

        $.getJSON('tailgate/Admin/Spot', {
            command : 'list',
            id : this.props.lotId
        }).done(function(data){
            this.setState({
                spots : data
            });
        }.bind(this));
    },

    toggleReserve : function(key,e) {
        var allSpots = this.state.spots;
        var spot = allSpots[key];
        // flops the value for the change
        var reserved = spot.reserved === '1' ? '0' : '1';

        $.post('tailgate/Admin/Spot', {
            command : 'reserve',
            id : spot.id,
            reserved : reserved
        })
        .done(function(){
            spot.reserved = reserved;
            allSpots[key] = spot;
            this.setState({
                spots : allSpots
            });
        }.bind(this))
        .fail(function(){
            var error_message = 'Error: Could not update the spot';
        }.bind(this));
    },

    toggleSober : function(key,e) {
        var allSpots = this.state.spots;
        var spot = allSpots[key];
        // flops the value for the change
        var sober = spot.sober === '1' ? '0' : '1';

        $.post('tailgate/Admin/Spot', {
            command : 'sober',
            id : spot.id,
            sober : sober
        })
        .done(function(){
            spot.sober = sober;
            allSpots[key] = spot;
            this.setState({
                spots : allSpots
            });
        }.bind(this))
        .fail(function(){
            var error_message = 'Error: Could not update the spot';
        }.bind(this));
    },

    pickup : function(index) {
        var allSpots = this.state.spots;
        var spot = allSpots[index];
        $.post('tailgate/Admin/Lottery/', {
            command : 'pickup',
            lotteryId : spot.lottery_id
        }, null, 'json').done(function(){
            spot.picked_up = '1';
            allSpots[index] = spot;
            this.setState({
                spots : allSpots
            });
        }.bind(this));
    },

    render : function() {
        if (this.state.spots.length === 0) {
            return React.createElement(Waiting, null);
        }
        var pickedUp;
        var lotteryInfo;
        var pickupClick;
        var timestamp = Math.floor(Date.now() / 1000);
        var showWinner = this.props.game !== null && this.props.game.signup_end < timestamp;
        var showPickedupButtons = this.props.game !== null && this.props.game.pickup_deadline > timestamp;
        var showPickedupStatus = this.props.game !== null && this.props.game.pickup_deadline < timestamp;
        return (
            React.createElement("div", null, 
                React.createElement("table", {className: "table table-striped sans"}, 
                    React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, 
                                "Number"
                            ), 
                            showWinner ? React.createElement("th", {className: "col-sm-3"}, "Lottery winner") : null, 
                            showPickedupButtons || showPickedupStatus ? React.createElement("th", {className: "col-sm-1"}, "Picked up") : null, 
                            React.createElement("th", null, 
                                "Reserved"
                            ), 
                            React.createElement("th", null, 
                                "Sobriety"
                            )
                        ), 
                        this.state.spots.map(function(value, i){
                            pickedUp = null;
                            if (showWinner) {
                                if (value.spot_id === null) {
                                    lotteryInfo = React.createElement("div", {className: "text-muted"}, React.createElement("em", null, "Not selected"));
                                } else {
                                    if (showPickedupButtons) {
                                        if (value.picked_up === '0') {
                                            var pickupClick = this.pickup.bind(this,i);
                                            pickedUp = React.createElement("button", {title: "Click when student arrives to pick up tag", className: "btn btn-sm btn-danger", onClick: pickupClick}, React.createElement("i", {className: "fa fa-thumbs-down"}));
                                        } else {
                                            pickedUp = React.createElement("button", {className: "btn btn-sm btn-success"}, React.createElement("i", {className: "fa fa-thumbs-up"}));
                                        }
                                    } else if (showPickedupStatus) {
                                        if (value.picked_up === '0') {
                                            pickedUp = React.createElement("i", {className: "fa fa-thumbs-o-down text-danger"});
                                        } else {
                                            pickedUp = React.createElement("i", {className: "fa fa-thumbs-o-up text-success"});
                                        }
                                    }
                                    lotteryInfo = React.createElement("div", null, React.createElement("strong", null, value.first_name, " ", value.last_name));
                                }
                            }

                            return (
                                React.createElement("tr", {key: i}, 
                                    React.createElement("td", {className: "text-center"}, value.number), 
                                    showWinner ? React.createElement("td", {className: "text-left"}, lotteryInfo) : null, 
                                    showPickedupButtons || showPickedupStatus ? React.createElement("td", null, pickedUp) : null, 
                                    React.createElement("td", null, value.reserved === '1' ?
                                            React.createElement(YesButton, {handleClick: this.toggleReserve.bind(this, i), label: 'Reserved'}) :
                                                React.createElement(NoButton, {handleClick: this.toggleReserve.bind(this, i), label: 'Not reserved'})), 
                                    React.createElement("td", null, value.sober === '1' ? React.createElement(Sober, {toggle: this.toggleSober.bind(this, i)}) : React.createElement(Alcohol, {toggle: this.toggleSober.bind(this, i)}))
                                )
                            );
                        }.bind(this))
                    )
                ), 
                React.createElement("div", {className: "text-center"}, React.createElement("button", {className: "btn btn-sm btn-danger", onClick: this.props.close}, React.createElement("i", {className: "fa fa-times"}), " Close"))
            )
        );
    }
});

var Sober = React.createClass({displayName: "Sober",
    render : function() {
        return (
            React.createElement("button", {className: "btn btn-default btn-sm", onClick: this.props.toggle}, React.createElement("i", {className: "fa fa-ban"}), " Sober only")
        );
    }
});

var Alcohol = React.createClass({displayName: "Alcohol",
    render : function() {
        return (
            React.createElement("button", {className: "btn btn-default btn-sm", onClick: this.props.toggle}, React.createElement("span", {className: "text-success"}, React.createElement("i", {className: "fa fa-beer"}), " Alcohol allowed"))
        );
    }
});

var Settings = React.createClass({displayName: "Settings",
    getInitialState: function() {
        return {
            newAccountInformation : '',
            replyTo : ''
        };
    },

    componentDidMount : function() {
        $.getJSON('tailgate/Admin/Settings', {
            command : 'list'
        }).done(function(data){
            this.setState({
                newAccountInformation : data.new_account_information,
                replyTo : data.reply_to
            });
        }.bind(this));
    },

    componentDidUpdate : function(props, state) {
        this.newAccountEditor = CKEDITOR.replace('newAccountInformation');
        this.newAccountEditor.setData(this.state.newAccountInformation);
        $('#replyTo').val(this.state.replyTo);
    },

    submitForm : function(e) {
        var replyTo = $('#replyTo').val();
        var goodEmail = false;
        e.preventDefault();
        $.getJSON('tailgate/Admin/Settings', {
            command : 'testEmail',
            replyTo : replyTo
        }).done(function(data){
            if (data.success === false) {
                $('#replyTo').css('borderColor', 'red');
            } else {
                $('#settingsForm').submit();
            }
        });
    },

    render : function() {
        return (
            React.createElement("div", null, 
                React.createElement("form", {method: "post", action: "tailgate/Admin/Settings/", id: "settingsForm"}, 
                    React.createElement("input", {type: "hidden", name: "command", value: "save"}), 
                    React.createElement(TextInput, {required: true, inputId: 'replyTo', label: 'Reply to email address', placeholder: 'Enter an email address students can reply to'}), 
                    React.createElement("label", null, "Tailgate new student account information"), 
                    React.createElement("textarea", {id: "newAccountInformation", className: "form-control", name: "newAccountInformation", defaultValue: this.state.newAccountInformation}), 
                    React.createElement("div", {style: {marginTop : '1em'}}, React.createElement("button", {className: "btn btn-success", onClick: this.submitForm}, React.createElement("i", {className: "fa fa-save"}), " Save content"))
                )
            )
        );
    }
});

var Waiting = React.createClass({displayName: "Waiting",
    render : function() {
        return (
            React.createElement("div", {className: "text-center"}, React.createElement("i", {className: "fa fa-cog fa-spin"}), " Loading...")
        );
    }
});

var Students = React.createClass({displayName: "Students",

    getInitialState: function() {
        return {
            students: [],
            limit : limitDefault,
            search : null,
            availableSpots : {},
            message : null
        };
    },

    componentDidMount: function() {
        this.loadStudents(this.state.limit);
        this.loadAvailableSpots();
    },

    loadAvailableSpots : function() {
        $.getJSON('tailgate/Admin/Lottery', {
            command : 'getUnclaimedSpots'
        }).done(function(data){
            this.setState({
                availableSpots : data
            });
        }.bind(this));
    },

    searchRows : function(e)
    {
        var search_phrase =  e.target.value;
        var search_length = search_phrase.length;

        window.setTimeout(function(){
            if (search_length > 2) {
                this.loadStudents(this.state.limit, search_phrase);
            } else if (search_length === 0) {
                this.loadStudents(this.state.limit, '');
            }
        }.bind(this), 600);
    },

    loadStudents : function(limit, search) {
        if (limit === undefined) {
            limit = this.state.limit;
        }
        if (search === undefined) {
            search = this.state.search;
        }

        if (search !== this.state.search) {
            limit = limitDefault;
        }
        $.getJSON('tailgate/Admin/Student/', {
            command : 'list',
            limit : limit,
            search : search
        }).done(function(data){
            this.setState({
                students : data,
                limit : limit,
                search : search
            });
        }.bind(this));
    },

    reset : function()
    {
        this.loadStudents(this.state.limit);
        this.loadAvailableSpots();
    },

    preventSpaces : function(e)
    {
        if (e.charCode == '32') {
            e.preventDefault();
        }
    },

    setMessage : function(message)
    {
        this.setState({
            message : message
        });
    },

    render: function() {
        var timestamp = Math.floor(Date.now() / 1000);
        var availableCount = 0;
        var availableSentence = null;
        var showAvailableCount = 0;
        if (this.props.game) {
            showAvailableCount = this.props.game.pickup_deadline < timestamp;
            if (showAvailableCount) {
                availableCount = this.state.availableSpots.length;
                if (availableCount > 1) {
                    availableSentence = React.createElement("div", {className: "alert alert-warning"}, "There are ", availableCount, " unclaimed spots left.");
                } else if (availableCount === 1) {
                    availableSentence = React.createElement("div", {className: "alert-danger alert"}, "There is just ", React.createElement("strong", null, "one"), " more unclaimed spot left.");
                } else {
                    React.createElement("div", {className: "alert alert-success"}, "All spots have been claimed.");
                }
            }
        }
        var nextLimit = this.state.limit + limitDefault;
        var nextButton = null;
        if (this.state.limit <= this.state.students.length) {
            nextButton = React.createElement("button", {className: "btn btn-default", onClick: this.loadStudents.bind(null, nextLimit, this.state.search)}, React.createElement("i", {className: "fa fa-plus"}), " Show more rows");
        }

        return (
            React.createElement("div", null, 
                this.state.message ? React.createElement("div", {className: "alert alert-danger"}, this.state.message) : null, 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-sm-4"}, 
                        React.createElement(TextInput, {placeholder: 'Search', handleChange: this.searchRows, handlePress: this.preventSpaces})
                    ), 
                    React.createElement("div", {className: "col-sm-8"}, 
                        showAvailableCount ? availableSentence : null
                    )
                ), 
                React.createElement("table", {className: "table table-striped sans"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, "Id"), 
                            React.createElement("th", null, "Last Name"), 
                            React.createElement("th", null, "First Name"), 
                            React.createElement("th", null, "Username"), 
                            React.createElement("th", null, "Wins"), 
                            React.createElement("th", {className: "text-center"}, "Eligible"), 
                            React.createElement("th", {className: "text-center"}, "Allowed"), 
                            this.props.game && this.props.game.pickup_deadline < timestamp ? React.createElement("th", null, "Current winner") : null, 
                            React.createElement("th", null, " ")
                        )
                    ), 
                    React.createElement("tbody", {id: "studentList"}, 
                        this.state.students.map(function(value,i){
                            return (
                                React.createElement(StudentRow, {key: i, student: value, resetRows: this.reset, canAdd: this.props.canAdd, spots: this.state.availableSpots, setMessage: this.setMessage, game: this.props.game})
                            );
                        }.bind(this))
                    )
                ), 
                nextButton
            )
        );
    }
});

var StudentRow = React.createClass({displayName: "StudentRow",

    eligible : function(e) {
        if (this.props.student.eligible === '1') {
            this.makeIneligible(this.props.resetRows);
        } else {
            this.makeEligible(this.props.resetRows);
        }
    },

    makeIneligible : function(reset) {
        var content = '<textarea id="ineligibleReason" class="form-control" name="ineligibleReason" placeholder="Please enter the reason for making this student ineligible."></textarea>' +
        '<button style="margin-top:1em" id="makeIneligible" class="btn btn-danger"><i class="fa fa-ban"></i> Prevent user from applying for current tailgate</button>';
        $('#admin-modal .modal-title').text('Make user ineligible: ' + this.props.student.first_name + ' ' + this.props.student.last_name);
        $('#admin-modal .modal-body').html(content);
        $('#makeIneligible').click(function(){
            var reason = $('#ineligibleReason').val();
            if (reason.length < 1) {
                $('#ineligibleReason').css('border-color', 'red');
            }
            $.post('tailgate/Admin/Student', {
                command : 'ineligible',
                id : this.props.student.id,
                reason : reason
            }).done(function(){
                reset();
            }.bind(this));
            $('#admin-modal').modal('hide');
        }.bind(this));
        $('#admin-modal').modal('show');
    },

    makeEligible : function(reset) {
        if (confirm('Click OK if you are sure you want to restore this student\'s eligiblity. Cancel if not.')) {
            $.post('tailgate/Admin/Student', {
                command : 'eligible',
                id : this.props.student.id
            }).done(function(){
                reset();
            });
        }
    },

    bannedReason : function(e) {
        if (this.props.student.banned === '1') {
            this.unBan(this.props.resetRows);
        } else {
            this.ban(this.props.resetRows);
        }
    },

    unBan : function(reset) {
        if (confirm('Click OK if you are sure you want to remove this student\'s ban. Cancel if not.')) {
            $.post('tailgate/Admin/Student', {
                command : 'unban',
                id : this.props.student.id
            }).done(function(){
                reset();
            });
        }
    },

    options : function() {
        var options = this.props.spots.map(function(spot){
            return '<option value="'+spot.id+'">'+spot.lot_title+' #'+spot.number+'</option>';
        });
        return options;
    },

    addSpot : function() {
        var content = '<select id="spotSelect" class="form-control">' + this.options() + '</select>' +
        '<button id="saveSpot" class="btn btn-success" style="margin-right:.5em">Assign student</button>';
        $('#admin-modal .modal-title').text('Assign spot to ' + this.props.student.first_name + ' ' + this.props.student.last_name);
        $('#admin-modal .modal-body').html(content);

        $('#saveSpot').click(function(){
            var spotId = $('#spotSelect').val();
            $.post('tailgate/Admin/Student', {
                command : 'assign',
                studentId : this.props.student.id,
                spotId : spotId
            }, null, 'json').done(function(data){
                if (data.success === true) {
                    this.props.setMessage('Spot assigned.');
                } else {
                    this.props.setMessage('Spot already taken.');
                }
                this.props.resetRows();
            }.bind(this));
            $('#admin-modal').modal('hide');
        }.bind(this));

        $('#admin-modal').modal('show');
    },

    ban: function() {
        var content = '<textarea id="bannedReason" class="form-control" name="bannedReason" placeholder="Please enter the reason for the ban."></textarea>' +
        '<button style="margin-top:1em" id="banUser" class="btn btn-danger"><i class="fa fa-ban"></i> Ban user from accessing system</button>';
        $('#admin-modal .modal-title').text('Ban user: ' + this.props.student.first_name + ' ' + this.props.student.last_name);
        $('#admin-modal .modal-body').html(content);
        $('#banUser').click(function(){
            var bannedReason = $('#bannedReason').val();
            if (bannedReason.length < 1) {
                $('#bannedReason').css('border-color', 'red');
            }
            $.post('tailgate/Admin/Student', {
                command : 'ban',
                id : this.props.student.id,
                reason : bannedReason
            }).done(function(){
                this.props.resetRows();
            }.bind(this));
            $('#admin-modal').modal('hide');
        }.bind(this));
        $('#admin-modal').modal('show');
    },

    deleteStudent : function() {
        if (confirm('Are you sure you want to PERMANENTLY delete this student?')) {
            $.post('tailgate/Admin/Student', {
                command : 'delete',
                id : this.props.student.id
            }).done(function(){
                    this.props.resetRows();
            }.bind(this));
        }
    },

    render : function() {
        var timestamp = Math.floor(Date.now() / 1000);
        var value = this.props.student;
        var winner = null;
        if (value.winner === '1' && value.picked_up === '1') {
            winner = React.createElement("span", {className: "text-success"}, "Yes");
        } else if (value.banned === '1') {
            winner = React.createElement("span", {className: "text-danger"}, "Banned");
        } else if (value.eligible === '0') {
            winner = React.createElement("span", {className: "text-warning"}, "Ineligible");
        } else if (this.props.spots.length > 0) {
            winner = React.createElement("button", {className: "btn btn-sm btn-primary", style: {marginRight : '1em'}, onClick: this.addSpot}, React.createElement("i", {className: "fa fa-plus"}), " Add to spot");
        } else {
            winner = React.createElement("span", {className: "text-info"}, "No");
        }
        var email = 'mailto:' + value.email;

        return(
            React.createElement("tr", null, 
                React.createElement("td", null, value.id), 
                React.createElement("td", null, value.last_name), 
                React.createElement("td", null, value.first_name), 
                React.createElement("td", null, React.createElement("a", {href: email}, value.username, " ", React.createElement("i", {className: "fa fa-envelope-o"}))), 
                React.createElement("td", {className: "text-right col-sm-1"}, value.wins), 
                React.createElement("td", {className: "text-center"}, React.createElement(EligibleIcon, {value: value, handleClick: this.eligible})), 
                React.createElement("td", {className: "text-center"}, React.createElement(BannedIcon, {value: value, handleClick: this.bannedReason})), 
                this.props.game && this.props.game.pickup_deadline < timestamp ? React.createElement("td", null, winner) : null, 
                React.createElement("td", null, 
                    React.createElement("button", {className: "btn btn-sm btn-danger", style: {marginRight : '1em'}, onClick: this.deleteStudent}, React.createElement("i", {className: "fa fa-trash-o"}), " Delete")
                )
            )
        );
    }
});

var Alert = React.createClass({displayName: "Alert",
    render: function() {
        return (
            React.createElement("div", {className: "alert alert-danger", role: "alert"}, 
                React.createElement("button", {type: "button", className: "close", "data-dismiss": "alert", "aria-label": "Close"}, 
                  React.createElement("span", {"aria-hidden": "true"}, "×")
                ), 
                React.createElement("i", {className: "fa fa-exclamation-circle"}), " ", this.props.message
            )
        );
    }
});

var TextInput = React.createClass({displayName: "TextInput",
    getDefaultProps: function() {
        return {
            label: '',
            placeholder: '',
            handleBlur:null,
            required: false,
            handlePress : null,
            handleChange : null,
            inputId : null,
            defaultValue : null
        };
    },

    handleBlur : function(e) {
        if (this.props.required && e.target.value.length < 1) {
            $(e.target).css('border-color', 'red');
        }
        if (this.props.handleBlur) {
            this.props.handleBlur(e);
        }
    },

    handleFocus : function(e) {
        $(e.target).css('border-color', '');
    },

    render : function() {
        var label = '';
        var required = '';
        if (this.props.label.length > 0) {
            if (this.props.required) {
                required = React.createElement("i", {className: "fa fa-asterisk text-danger"});
            }
            label = React.createElement("label", {htmlFor: this.props.inputId}, this.props.label);
        } else {
            label = null;
        }
        return (
            React.createElement("div", {className: "form-group"}, 
                label, " ", required, 
                React.createElement("input", {type: "text", className: "form-control", id: this.props.inputId, 
                    name: this.props.inputId, placeholder: this.props.placeholder, onFocus: this.handleFocus, 
                    onChange: this.props.handleChange, onBlur: this.handleBlur, onKeyPress: this.props.handlePress, defaultValue: this.props.defaultValue})
            )
        );
    }
});

var Modal = React.createClass({displayName: "Modal",
    render: function() {
        return (
            React.createElement("div", {id: "admin-modal", className: "modal fade"}, 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                        React.createElement("div", {className: "modal-header"}, 
                            React.createElement("button", {"aria-label": "Close", className: "close", "data-dismiss": "modal", type: "button"}, 
                                React.createElement("span", {"aria-hidden": "true"}, "×")
                            ), 
                            React.createElement("h4", {className: "modal-title"})
                        ), 
                        React.createElement("div", {className: "modal-body"}
                        ), 
                        React.createElement("div", {className: "modal-footer"}, 
                            React.createElement("button", {className: "btn btn-default", "data-dismiss": "modal", type: "button"}, "Close")
                        )
                    )
                )
            )
        );
    }
});

var Icon = React.createClass({displayName: "Icon",

    render : function () {
        var style = null;
        if (typeof this.props.handleClick === 'function') {
            style = {cursor : 'pointer'};
        }
        return (
            React.createElement("i", {style: style, className: 'fa fa-check fa-lg ' + this.props.iconClass, onClick: this.props.handleClick, onMouseOver: this.props.handleOver, title: this.props.title})
        );
    }
});

var EligibleIcon = React.createClass({displayName: "EligibleIcon",
    hover : function(e) {
        if (this.props.value.eligible == '0') {
            $(e.target).tooltip('show');
        } else {
            $(e.target).tooltip('destroy');
        }
    },

    render : function() {
        var title = null;
        var iconClass = null;
        if (this.props.value.eligible == '1') {
            iconClass = 'fa-check text-success';
            title = 'Eligible';
        } else {
            iconClass = 'fa-times text-danger';
            title = 'Reason: ' + this.props.value.ineligible_reason;
        }
        return (
            React.createElement(Icon, {iconClass: iconClass, handleClick: this.props.handleClick, handleOver: this.hover, title: title})
        );
    }
});

var BannedIcon = React.createClass({displayName: "BannedIcon",

    hover : function(e) {
        if (this.props.value.banned == '1') {
            $(e.target).tooltip('show');
        } else {
            $(e.target).tooltip('destroy');
        }
    },

    render : function() {
        var title = null;
        var bannedDate = new Date(this.props.value.banned_date * 1000);
        var iconClass = null;
        if (this.props.value.banned == '1') {
            iconClass = 'fa-times text-danger';
            title = 'Banned: ' + bannedDate.toLocaleDateString() + "\nReason: " + this.props.value.banned_reason;
        } else {
            iconClass = 'fa-check text-success';
            title = 'Click to ban student';
        }
        return (
            React.createElement(Icon, {iconClass: iconClass, handleClick: this.props.handleClick, handleOver: this.hover, title: title})
        );
    }
});

var YesIcon = React.createClass({displayName: "YesIcon",
    render : function() {
        return (
            React.createElement(Icon, {iconClass: 'fa-check text-success'})
        );
    }
});

var NoIcon = React.createClass({displayName: "NoIcon",
    render : function() {
        return (
            React.createElement(Icon, {iconClass: 'fa-times text-danger'})
        );
    }
});

var YesButton = React.createClass({displayName: "YesButton",
        render : function () {
            return (
                React.createElement("button", {onClick: this.props.handleClick, className: "btn btn-sm btn-success"}, 
                    React.createElement("i", {className: "fa fa-check"}), " ", this.props.label
                )
            );
        }
});

var NoButton = React.createClass({displayName: "NoButton",
        render : function () {
            return (
                React.createElement("button", {onClick: this.props.handleClick, className: "btn btn-sm btn-default"}, 
                    React.createElement("i", {className: "fa fa-times"}), " ", this.props.label
                )
            );
        }
});

var Example = (props) => (
    React.createElement("div", null, props.foo)
);

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
$(window).load(function(){ReactDOM.render(React.createElement(Setup, null), document.getElementById('tailgate-setup'));});
