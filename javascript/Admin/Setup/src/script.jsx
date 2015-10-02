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

var Setup = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    getInitialState: function() {
        return {
            currentTab : 'lots',
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
        if (this.state.currentGame.id !== undefined) {
            canAdd = true;
        }
        switch(this.state.currentTab) {
            case 'games':
            pageContent = <Games startLottery={this.startLottery} lots={this.state.lots}/>;
            break;

            case 'lottery':
            pageContent = <RunLottery currentGame={this.state.currentGame} loadGame={this.loadGame}/>;
            break;

            case 'visitors':
            pageContent = <Visitors/>;
            break;

            case 'lots':
            pageContent = <Lots lots={this.state.lots} loadLots={this.loadLots}/>;
            break;

            case 'students':
            pageContent = <Students canAdd={canAdd} game={this.state.currentGame}/>;
            break;

            case 'reports':
            pageContent = <Reports/>;
            break;

            case 'settings':
            pageContent = <Settings replyTo={this.state.replyTo} newStudent={this.state.newStudent}/>;
            break;
        }
        return (
            <div>
                <ul className="nav nav-tabs">
                  <li role="presentation" className={this.state.currentTab === 'games' || this.state.currentTab === 'lottery' ? 'active' : ''} onClick={this.changeTab.bind(null, 'games')}><a style={{cursor:'pointer'}}>Games</a></li>
                  <li role="presentation" className={this.state.currentTab === 'visitors' ? 'active' : ''} onClick={this.changeTab.bind(null, 'visitors')}><a style={{cursor:'pointer'}}>Visitors</a></li>
                  <li role="presentation" className={this.state.currentTab === 'lots' ? 'active' : ''} onClick={this.changeTab.bind(null, 'lots')}><a style={{cursor:'pointer'}}>Lots</a></li>
                  <li role="presentation" className={this.state.currentTab === 'students' ? 'active' : ''} onClick={this.changeTab.bind(null, 'students')}><a style={{cursor:'pointer'}}>Students</a></li>
                  <li role="presentation" className={this.state.currentTab === 'reports' ? 'active' : ''} onClick={this.changeTab.bind(null, 'reports')}><a style={{cursor:'pointer'}}>Reports</a></li>
                  <li role="presentation" className={this.state.currentTab === 'settings' ? 'active' : ''} onClick={this.changeTab.bind(null, 'settings')}><a style={{cursor:'pointer'}}>Settings</a></li>
                </ul>
                <hr />
                {pageContent}
                <Modal />
            </div>
        );
    }
});

/**
 * Switching the tab to this lottery starts it up.
 */
var RunLottery = React.createClass({
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
            <div>
                <h4>Running lottery for {this.props.currentGame.university} {this.props.currentGame.mascot} - {this.props.currentGame.kickoff_format}</h4>
                <div><pre style={{height : '300px', width : '100%'}}>{this.state.messageLog}</pre></div>
            </div>
        );
    }
});

var Visitors = React.createClass({
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
            //console.log(jse);
        });
    },

    render : function() {
        var visitorForm;
        if (this.state.showForm) {
            visitorForm = <VisitorForm closeForm={this.hideForm} loadVisitors={this.loadVisitors}/>;
        } else {
            visitorForm = null;
        }

        return (
            <div>
                <p><button className="btn btn-success" onClick={this.showForm}><i className="fa fa-plus"></i> Add Team</button></p>
                {visitorForm}
                <table className="table table-striped">
                    <tbody>
                        {this.state.visitors.map(function(value, i){
                            var removeClick = this.removeVisitor.bind(this,i);
                            return (
                                <tr key={i}>
                                    <td>
                                    <button className="btn btn-sm btn-danger pull-right" onClick={removeClick}>
                                        <i className="fa fa-times"></i> Remove</button> {value.university} - {value.mascot}
                                    </td>
                                </tr>
                            );
                        }, this)}
                    </tbody>
                </table>
            </div>
        );
    }
});

var VisitorForm = React.createClass({
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
                var error_message = <Alert message={'Error: Check your university and mascot inputs for correct information'} />;
                this.setState({
                    message : error_message
                });
            }.bind(this));
        }
    },

    render : function() {
        return (
            <div>
                <div className="row well">
                    {this.state.message}
                    <div className="form-group col-sm-6">
                        <TextInput label={'University:'} inputId={'university'} />
                    </div>
                    <div className="form-group col-sm-6">
                        <TextInput label={'Mascot:'} inputId={'mascot'} />
                    </div>
                    <div className="col-sm-12 text-center">
                        <button className="btn btn-primary" onClick={this.save}><i className="fa fa-save"></i> Save</button>&nbsp;
                        <button className="btn btn-default" onClick={this.props.closeForm}><i className="fa fa-times"></i> Close</button>
                    </div>
                </div>
            </div>
        );
    }
});

var Lots = React.createClass({
    mixins: [tgMixin],

    getInitialState : function() {
        return {
            showForm: false
        };
    },

    render : function() {
        var lotForm;
        if (this.state.showForm) {
            lotForm = <LotForm closeForm={this.hideForm} loadLots={this.props.loadLots}/>;
        } else {
            lotForm = null;
        }
        return (
            <div>
                <p><button className="btn btn-success" onClick={this.showForm}><i className="fa fa-plus"></i> Add Tailgating Lot</button></p>
                {lotForm}
                <LotListing lots={this.props.lots} />
            </div>
        );
    }
});

var LotListing = React.createClass({

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

    render : function() {
        return (
            <div>
                {this.props.lots.map(function(value, i){
                    return (
                        <div className="panel panel-default" key={i}>
                            <div className="panel-body row">
                                <div className="col-sm-6">{value.title}</div>
                                <div className="col-sm-3"><strong>Total spots:</strong> {value.total_spots}</div>
                                <div className="col-sm-3">
                                    <button className="btn btn-primary btn-sm" onClick={this.manageSpots.bind(this, i)}>
                                        Manage Spots <i className={this.state.spotKey === i ? 'fa fa-caret-up' : 'fa fa-caret-down'}></i>
                                    </button>
                                </div>
                                {this.state.spotKey === i ? <Spots lotId={value.id} close={this.resetSpots} /> : null}
                            </div>
                        </div>
                    );
                }.bind(this))}
            </div>
        );
    }
});

var LotForm = React.createClass({
    getInitialState : function() {
        return {
            message : ''
        };
    },

    save : function() {
        var title = $('#lotTitle').val();
        var totalSpaces = $('#totalSpaces').val();
        if (title.length > 0 && totalSpaces.length > 0) {
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
                var error_message = <Alert message={'Error: Check your lot name and total spaces for correct information'} />;
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
            <div>
                <div className="row well">
                    {this.state.message}
                    <div className="form-group col-sm-6">
                        <TextInput label={'Name of lot'} inputId={'lotTitle'} required={true}/>
                    </div>
                    <div className="form-group col-sm-3">
                        <TextInput label={'Total spaces:'} inputId={'totalSpaces'} handlePress={this.forceNumbers} required={true}/>
                    </div>
                    <div className="col-sm-12 text-center">
                        <button className="btn btn-primary" onClick={this.save}><i className="fa fa-save"></i> Save</button>&nbsp;
                        <button className="btn btn-default" onClick={this.props.closeForm}><i className="fa fa-times"></i> Close</button>
                    </div>
                </div>
            </div>
        );
    }
});

var Spots = React.createClass({
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
            console.log('Lot id is zero');
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
            console.log(error_message);
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
            console.log(error_message);
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
            return <Waiting/>;
        }
        var pickedUp;
        var lotteryInfo;
        var pickupClick;
        return (
            <div>
                <table className="table table-striped sans">
                    <tbody>
                        <tr>
                            <th className="col-sm-1">
                                Number
                            </th>
                            <th className="col-sm-2">Picked up</th>
                            <th className="col-sm-3">
                                Lottery winner
                            </th>
                            <th className="col-sm-3">
                                Reserved
                            </th>
                            <th className="col-sm-3">
                                Sobriety
                            </th>
                        </tr>
                        {this.state.spots.map(function(value, i){
                            pickedUp = null;
                            if (value.spot_id === null) {
                                lotteryInfo = <div className="text-muted"><em>Not selected</em></div>;
                            } else {
                                if (value.picked_up === '0') {
                                    var pickupClick = this.pickup.bind(this,i);
                                    pickedUp = <button title="Click when student arrives to pick up tag" className="btn btn-sm btn-danger" onClick={pickupClick}><i className="fa fa-times"></i></button>;
                                } else {
                                    pickedUp = <span className="text-success"><YesIcon/></span>;
                                }
                                lotteryInfo = <div><strong>{value.first_name} {value.last_name}</strong></div>;
                            }

                            return (
                                <tr key={i}>
                                    <td className="text-center">{value.number}</td>
                                    <td>{pickedUp}</td>
                                    <td className="text-left">{lotteryInfo}</td>
                                    <td>{value.reserved === '1' ?
                                            <YesButton handleClick={this.toggleReserve.bind(this, i)} label={'Reserved'}/> :
                                                <NoButton handleClick={this.toggleReserve.bind(this, i)} label={'Not reserved'}/>}</td>
                                    <td>{value.sober === '1' ? <Sober toggle={this.toggleSober.bind(this, i)} /> : <Alcohol toggle={this.toggleSober.bind(this, i)} />}</td>
                                </tr>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
                <div className="text-center"><button className="btn btn-sm btn-danger" onClick={this.props.close}><i className="fa fa-times"></i> Close</button></div>
            </div>
        );
    }
});

var Sober = React.createClass({
    render : function() {
        return (
            <button className="btn btn-default btn-sm" onClick={this.props.toggle}><i className="fa fa-ban"></i> Sober only</button>
        );
    }
});

var Alcohol = React.createClass({
    render : function() {
        return (
            <button className="btn btn-default btn-sm" onClick={this.props.toggle}><span className="text-success"><i className="fa fa-beer"></i> Alcohol allowed</span></button>
        );
    }
});

var Settings = React.createClass({
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
            <div>
                <form method="post" action="tailgate/Admin/Settings/" id="settingsForm">
                    <input type="hidden" name="command" value="save"/>
                    <TextInput required={true} inputId={'replyTo'} label={'Reply to email address'} placeholder={'Enter an email address students can reply to'}/>
                    <label>Tailgate new student account information</label>
                    <textarea id="newAccountInformation" className="form-control" name="newAccountInformation" defaultValue={this.state.newAccountInformation} />
                    <div style={{marginTop : '1em'}}><button className="btn btn-success" onClick={this.submitForm}><i className="fa fa-save"></i> Save content</button></div>
                </form>
            </div>
        );
    }
});

var Waiting = React.createClass({
    render : function() {
        return (
            <div className="text-center"><i className="fa fa-cog fa-spin"></i> Loading...</div>
        );
    }
});

var Students = React.createClass({

    getInitialState: function() {
        return {
            students: [],
            limit : limitDefault,
            search : null
        };
    },

    componentDidMount: function() {
        this.loadStudents(this.state.limit);
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

    preventSpaces : function(e)
    {
        if (e.charCode == '32') {
            e.preventDefault();
        }
    },

    render: function() {
        var nextLimit = this.state.limit + limitDefault;
        var nextButton = null;
        if (this.state.limit <= this.state.students.length) {
            nextButton = <button className="btn btn-default" onClick={this.loadStudents.bind(null, nextLimit, this.state.search)}><i className="fa fa-plus"></i> Show more rows</button>;
        }
        return (
            <div>
                <div className="row">
                    <div className="col-sm-4">
                        <TextInput placeholder={'Search'} handleChange={this.searchRows} handlePress={this.preventSpaces}/>
                    </div>
                </div>
                <table className="table table-striped sans">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Username</th>
                            <th>Wins</th>
                            <th className="text-center">Eligible</th>
                            <th className="text-center">Allowed</th>
                            <th>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody id="studentList">
                        {this.state.students.map(function(value,i){
                            return (
                                <StudentRow key={i} student={value} resetRows={this.loadStudents} canAdd={this.props.canAdd}/>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
                {nextButton}
            </div>
        );
    }
});

var StudentRow = React.createClass({
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
        var value = this.props.student;

        return(
            <tr>
                <td>{value.id}</td>
                <td>{value.last_name}</td>
                <td>{value.first_name}</td>
                <td><a href="mailto:{value.email}">{value.username} <i className="fa fa-envelope-o"></i></a></td>
                <td className="text-right col-sm-1">{value.wins}</td>
                <td className="text-center"><EligibleIcon value={value} handleClick={this.eligible}/></td>
                <td className="text-center"><BannedIcon value={value} handleClick={this.bannedReason}/></td>
                <td>
                    <button className="btn btn-sm btn-danger" style={{marginRight : '1em'}} onClick={this.deleteStudent}><i className="fa fa-trash-o"></i> Delete</button>
                </td>
            </tr>
        );
    }
});

var Reports = React.createClass({

    render: function() {
        return (
            <div>Reports</div>
        );
    }
});

var Games = React.createClass({
    mixins: [tgMixin],

    getInitialState: function() {
        return {
            visitors : [],
            availableSpots : 0,
            submissions : 0,
            games : null,
            currentGame : {},
            message : ''
        };
    },

    loadGames : function() {
        $.getJSON('tailgate/Admin/Game', {
            command : 'list'
        }).done(function(data){
            this.setState({
                currentGame : data.currentGame,
                availableSpots : data.available_spots,
                games : data.listing
            });
        }.bind(this));
    },

    componentDidMount : function() {
        this.loadVisitors();
        this.loadGames();
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
                        this.setState({
                            message : ''
                        });
                    }.bind(this));
                } else {
                    this.setState({
                        message : 'Pickup date must be less than gate date'
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
            message = <div className="alert alert-danger">{this.state.message}</div>;
        }

        if (this.state.games === null) {
            previousGames = <p>No games found</p>;
        } else {
            previousGames = <GameListing games={this.state.games} />;
        }

        if (this.state.currentGame === null) {
            title = 'Add new game';
            if(this.state.visitors.length === 0) {
                currentGame = <div><p>Create some visitors first.</p></div>;
            } else if(this.props.lots.length === 0) {
                currentGame = <div><p>Create some tailgate lots first.</p></div>;
            } else {
                currentGame = <GameForm visitors={this.state.visitors} save={this.saveGame} />;
            }
        } else if (Object.keys(this.state.currentGame).length > 0) {
            currentGame = <GameInfo game={this.state.currentGame} startLottery={this.props.startLottery} submissions={this.state.submissions} loadCurrentGame={this.loadGames} availableSpots={this.state.availableSpots}/>;
        } else {
            currentGame = null;
        }

        return (
            <div>
                <div className="well">
                    <div className="row">
                        <div className="col-sm-12">
                            <h3>{title}</h3>
                            {message}
                        </div>
                    </div>
                    {currentGame}
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Previous games</h3>
                        {previousGames}
                    </div>
                </div>
            </div>
        );
    }
});

var GameInfo = React.createClass({

    getInitialState: function() {
        return {
            game : {},
            message : null
        };
    },

    componentDidMount : function() {
        if (this.props.game.lottery_run == '0') {
            this.initializeDateTime(this.props.game);
        }
        this.updateGame(this.props.game);
    },

    updateGame : function(game) {
        if (game.signup_start >= game.signup_end) {
            this.setState({
                message : 'Signup start must precede signup deadline'
            });
            return;
        } else if (game.signup_end >= game.pickup_deadline) {
            this.setState({
                message : 'Signup deadline must precede pickup deadline'
            });
            return;
        } else if (game.pickup_deadline >= game.kickoff) {
            this.setState({
                message : 'Pickup deadline must precede kickoff'
            });
            return;
        } else if (this.state.message !== null) {
            this.setState({
                message : null
            });
            return;
        }

        this.setState({
            game : game
        });

        if (game.lottery_run == '0') {

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

    initializeDateTime : function(game)
    {
        $('#signup-start').datetimepicker({
            timepicker:true,
            format: 'Y/m/d H:i',
            onChangeDateTime : function(ct, i) {
                $.post('tailgate/Admin/Game', {
                    command : 'changeDate',
                    game_id : game.id,
                    signup_start : ct
                }, function(){}, 'json').done(function(data){
                    this.updateGame(data);
                }.bind(this));
            }.bind(this),
        });

        $('#signup-end').datetimepicker({
            timepicker:true,
            format: 'Y/m/d H:i',
            onChangeDateTime : function(ct, i) {
                $.post('tailgate/Admin/Game', {
                    command : 'changeDate',
                    game_id : game.id,
                    signup_end : ct
                }, function(){}, 'json').done(function(data){
                    this.updateGame(data);
                }.bind(this));
            }.bind(this),
        });

        $('#pickup-deadline').datetimepicker({
            timepicker:true,
            format: 'Y/m/d H:i',
            onChangeDateTime : function(ct, i) {
                $.post('tailgate/Admin/Game', {
                    command : 'changeDate',
                    game_id : game.id,
                    pickup_deadline : ct
                }, function(){}, 'json').done(function(data){
                    this.updateGame(data);
                }.bind(this));
            }.bind(this),
        });

        $('#kickoff').datetimepicker({
            timepicker:false,
            format: 'Y/m/d',
            onChangeDateTime : function(ct, i) {
                $.post('tailgate/Admin/Game', {
                    command : 'changeDate',
                    game_id : game.id,
                    kickoff : ct
                }, function(){}, 'json').done(function(data){
                    this.updateGame(data);
                }.bind(this));
            }.bind(this),
        });
    },

    completeGame : function() {
        $.post('tailgate/Admin/Lottery', {
            command : 'completeGame',
            game_id : this.props.game.id
        });
        this.props.loadCurrentGame();
    },

    signupStartDate : function() {
        $('#signup-start').datetimepicker('show');
    },

    signupEndDate : function() {
        $('#signup-end').datetimepicker('show');
    },

    pickupDeadlineDate : function() {
        $('#pickup-deadline').datetimepicker('show');
    },

    kickoffDate : function() {
        $('#kickoff').datetimepicker('show');
    },

    render : function() {
        var button = null;
        var message = null;

        if (this.props.game.lottery_run == '0') {
            button = <LotteryRun game={this.state.game} startLottery={this.props.startLottery}/>;
        } else if (this.props.game.kickoff < Math.floor(Date.now() / 1000)) {
            button = <button className="btn btn-primary" onClick={this.completeGame}>Complete lottery</button>;
        }

        if (this.state.message) {
            message = <div className="alert alert-danger"><i className="fa fa-exclamation-circle"></i> {this.state.message}</div>;
        } else {
            message = null;
        }

        return (
        <div>
            <h4>{this.props.game.university} {this.props.game.mascot} - Total submissions: {this.props.submissions}, Available spots: {this.props.availableSpots}</h4>
            {message}
            <div className="row">
                <div className="col-sm-3">
                    <div className="alert alert-success">
                        {this.props.game.lottery_run == '0' ? <button className="pull-right btn btn-sm btn-primary" id="signup-start" onClick={this.signupStartDate}>Edit</button> : null}
                        <big><strong>Signup start</strong></big><br />
                        {this.state.game.signup_start_format}
                    </div>
                </div>
                <div className="col-sm-3">
                    <div className="alert alert-success">
                        {this.props.game.lottery_run == '0' ? <button className="pull-right btn btn-sm btn-primary" id="signup-end" onClick={this.signupEndDate}>Edit</button> : null}
                        <big><strong>Signup deadline</strong></big><br />
                        {this.state.game.signup_end_format}
                    </div>
                </div>
                <div className="col-sm-3">
                    <div className="alert alert-success">
                        {this.props.game.lottery_run == '0' ? <button className="pull-right btn btn-sm btn-primary" id="pickup-deadline" onClick={this.pickupDeadlineDate}>Edit</button> : null}
                        <big><strong>Pickup Deadline</strong></big><br />
                        {this.state.game.pickup_deadline_format}
                    </div>
                </div>
                <div className="col-sm-3">
                    <div className="alert alert-success">
                        {this.props.game.lottery_run == '0' ? <button className="pull-right btn btn-sm btn-primary" id="kickoff" onClick={this.kickoffDate}>Edit</button> : null}
                        <big><strong>Kickoff:</strong></big><br />{this.state.game.kickoff_format}
                    </div>
                </div>
            </div>
            {button}
        </div>
        );
    }
});

var LotteryRun = React.createClass({
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
                    <div>
                        <p>Are you sure you want to start the lottery?</p>
                        <button style={{marginRight : '1em'}} className="btn btn-success btn-lg" onClick={this.props.startLottery}><i className="fa fa-check"></i> Confirm: Start lottery</button>
                        <button className="btn btn-danger btn-lg" onClick={this.stopLottery}><i className="fa fa-times"></i> Cancel running lottery</button>
                    </div>
                );
            } else {
                button = <button className="btn btn-primary btn-lg" onClick={this.confirmLottery}>Start lottery</button>;
            }
        }
        return (
            <div className="text-center">{button}</div>
        );
    }
});

var GameForm = React.createClass({
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
                <option key={i} value={value.id}>{value.university} - {value.mascot}</option>
            );
        }.bind(this));
        return (
            <div>
                <div className="row">
                    <div className="col-sm-6">
                        <label htmlFor="pick-team">Pick visiting team</label>
                        <select id="pick-team" className="form-control">
                            {options}
                        </select>
                    </div>
                    <div className="col-sm-6">
                        <TextInput inputId={'kickoff'} label="Game date" ref="date" defaultValue={dateString}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <TextInput inputId={'signup-start'} label="Signup start" ref="date" defaultValue={datetimeString}/>
                    </div>
                    <div className="col-sm-4">
                        <TextInput inputId={'signup-end'} label="Signup deadline" ref="date" defaultValue={datetimeString}/>
                    </div>
                    <div className="col-sm-4">
                        <TextInput inputId={'pickup-deadline'} label="Pickup deadline" ref="date" defaultValue={datetimeString}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 text-center">
                        <button className="btn btn-success" onClick={this.props.save}><i className="fa fa-save"></i> Save game</button>
                    </div>
                </div>
            </div>
        );
    }
});

var GameListing = React.createClass({
    render : function() {
        return (
            <table className="table table-striped sans">
                <tbody>
                {this.props.games.map(function(value, i){
                    return (
                        <tr key={i}>
                            <td>{value.university} {value.mascot} - {value.kickoff_format}</td>
                        </tr>
                    );
                }.bind(this))}
                </tbody>
            </table>
        );
    }
});

var Alert = React.createClass({
    render: function() {
        return (
            <div className="alert alert-danger" role="alert">
                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <i className="fa fa-exclamation-circle"></i> {this.props.message}
            </div>
        );
    }
});

var TextInput = React.createClass({
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
                required = <i className="fa fa-asterisk text-danger"></i>;
            }
            label = <label htmlFor={this.props.inputId}>{this.props.label}</label>;
        } else {
            label = null;
        }
        return (
            <div className="form-group">
                {label} {required}
                <input type="text" className="form-control" id={this.props.inputId}
                    name={this.props.inputId} placeholder={this.props.placeholder} onFocus={this.handleFocus}
                    onChange={this.props.handleChange} onBlur={this.handleBlur} onKeyPress={this.props.handlePress} defaultValue={this.props.defaultValue}/>
            </div>
        );
    }
});

var Modal = React.createClass({
    render: function() {
        return (
            <div id="admin-modal" className="modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button aria-label="Close" className="close" data-dismiss="modal" type="button">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title"></h4>
                        </div>
                        <div className="modal-body">
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default" data-dismiss="modal" type="button">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var Icon = React.createClass({

    render : function () {
        var style = null;
        if (typeof this.props.handleClick === 'function') {
            style = {cursor : 'pointer'};
        }
        return (
            <i style={style} className={'fa fa-check fa-lg ' + this.props.iconClass} onClick={this.props.handleClick} onMouseOver={this.props.handleOver} title={this.props.title}></i>
        );
    }
});

var EligibleIcon = React.createClass({
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
            <Icon iconClass={iconClass} handleClick={this.props.handleClick} handleOver={this.hover} title={title} />
        );
    }
});

var BannedIcon = React.createClass({

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
            <Icon iconClass={iconClass} handleClick={this.props.handleClick} handleOver={this.hover} title={title} />
        );
    }
});

var YesIcon = React.createClass({
    render : function() {
        return (
            <Icon iconClass={'fa-check text-success'} />
        );
    }
});

var NoIcon = React.createClass({
    render : function() {
        return (
            <Icon iconClass={'fa-times text-danger'} />
        );
    }
});

var YesButton = React.createClass({
        render : function () {
            return (
                <button onClick={this.props.handleClick} className="btn btn-sm btn-success">
                    <i className="fa fa-check"></i> {this.props.label}
                </button>
            );
        }
});

var NoButton = React.createClass({
        render : function () {
            return (
                <button onClick={this.props.handleClick}  className="btn btn-sm btn-default">
                    <i className="fa fa-times"></i> {this.props.label}
                </button>
            );
        }
});


// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(<Setup/>, document.getElementById('tailgate-setup'));
