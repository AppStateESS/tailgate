var limitDefault = 10;

var Setup = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    getInitialState: function() {
        return {
            currentTab : 'students'
        };
    },

    changeTab : function(e) {
        this.setState({
            currentTab : e
        });
    },

    render : function() {
        var pageContent;

        switch(this.state.currentTab) {
            case 'visitors':
            pageContent = <Visitors/>;
            break;

            case 'lots':
            pageContent = <Lots/>;
            break;

            case 'students':
            pageContent = <Students/>;
            break;

            case 'reports':
            pageContent = <Reports/>;
            break;

            case 'content':
            pageContent = <Content/>;
            break;
        }
        return (
            <div>
                <ul className="nav nav-tabs">
                  <li role="presentation" className={this.state.currentTab === 'visitors' ? 'active' : ''} onClick={this.changeTab.bind(null, 'visitors')}><a style={{cursor:'pointer'}}>Visitors</a></li>
                  <li role="presentation" className={this.state.currentTab === 'lots' ? 'active' : ''} onClick={this.changeTab.bind(null, 'lots')}><a style={{cursor:'pointer'}}>Lots</a></li>
                  <li role="presentation" className={this.state.currentTab === 'students' ? 'active' : ''} onClick={this.changeTab.bind(null, 'students')}><a style={{cursor:'pointer'}}>Students</a></li>
                  <li role="presentation" className={this.state.currentTab === 'reports' ? 'active' : ''} onClick={this.changeTab.bind(null, 'reports')}><a style={{cursor:'pointer'}}>Reports</a></li>
                  <li role="presentation" className={this.state.currentTab === 'content' ? 'active' : ''} onClick={this.changeTab.bind(null, 'content')}><a style={{cursor:'pointer'}}>Content</a></li>
                </ul>
                <hr />
                {pageContent}
                <Modal />
            </div>
        );
    }
});

var formMixin = {
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
};

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

var Visitors = React.createClass({
    mixins: [formMixin],

    getInitialState: function() {
        return {
            visitors : [],
            showForm : false
        };
    },

    componentDidMount: function() {
        this.loadVisitors();
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
    mixins: [formMixin],

    getInitialState : function() {
        return {
            lots : [],
            showForm: false
        };
    },

    componentDidMount: function() {
        this.loadLots();
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


    render : function() {
        var lotForm;
        if (this.state.showForm) {
            lotForm = <LotForm closeForm={this.hideForm} loadLots={this.loadLots}/>;
        } else {
            lotForm = null;
        }
        return (
            <div>
                <p><button className="btn btn-success" onClick={this.showForm}><i className="fa fa-plus"></i> Add Tailgating Lot</button></p>
                {lotForm}
                <LotListing lots={this.state.lots} />
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

    render : function() {
        if (this.state.spots.length === 0) {
            return <Waiting/>;
        }
        return (
            <div>
                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <th className="col-sm-1">
                                Number
                            </th>
                            <th className="col-sm-3 text-center">
                                Selected
                            </th>
                            <th className="col-sm-3 text-center">
                                Picked up
                            </th>
                            <th>
                                Reserved
                            </th>
                        </tr>
                        {this.state.spots.map(function(value, i){
                            return (
                                <tr key={i}>
                                    <td className="text-right">{value.number}</td>
                                    <td className="text-center">{value.selected === '1' ? <YesIcon/> : <NoIcon/>}</td>
                                    <td className="text-center">{value.picked_up === '1' ? <YesIcon/> : <NoIcon/>}</td>
                                    <td>{value.reserved === '1' ?
                                            <YesButton handleClick={this.toggleReserve.bind(this, i)} label={'Reserved'}/> :
                                                <NoButton handleClick={this.toggleReserve.bind(this, i)} label={'Not reserved'}/>}</td>
                                </tr>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
                <div className="text-center"><button className="btn btn-sm btn-danger" onClick={this.props.close}><i className="fa fa-times"></i> Close spot listing</button></div>
            </div>
        );
    }
});

YesIcon = React.createClass({
    render : function() {
        return (
            <Icon iconClass={'fa-check fa-success'} />
        );
    }
});

NoIcon = React.createClass({
    render : function() {
        return (
            <Icon iconClass={'fa-times text-danger'} />
        );
    }
});



var Content = React.createClass({
    getInitialState: function() {
        return {
            newAccountInformation : '',
        };
    },

    componentDidMount : function() {
        $.getJSON('tailgate/Admin/Content', {
            command : 'list'
        }).done(function(data){
            this.setState({
                newAccountInformation : data.new_account_information
            });
        }.bind(this));
    },

    componentDidUpdate : function(props, state) {
        this.newAccountEditor = CKEDITOR.replace('newAccountInformation');
        this.newAccountEditor.setData(this.state.newAccountInformation);
    },

    render : function() {
        return (
            <div>
                <form method="post" action="tailgate/Admin/Content/">
                    <input type="hidden" name="command" value="save"/>
                    <label>Tailgate new student account information</label>
                    <textarea id="newAccountInformation" className="form-control" name="newAccountInformation" defaultValue={this.state.newAccountInformation} />
                    <div style={{marginTop : '1em'}}><button className="btn btn-success"><i className="fa fa-save"></i> Save content</button></div>
                </form>
            </div>
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

var Waiting = React.createClass({
    render : function() {
        return (
            <div className="text-center"><i className="fa fa-cog fa-spin"></i> Loading...</div>
        );
    }
});

var StudentRow = React.createClass({
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

    ban: function(reset) {
        var content = '<textarea id="bannedReason" class="form-control" name="bannedReason" placeholder="Please the reason for the ban."></textarea>' +
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
                reset();
            }.bind(this));
            $('#admin-modal').modal('hide');
        }.bind(this));
        $('#admin-modal').modal('show');
    },

    render : function() {
        var value = this.props.student;
        return(
            <tr>
                <td>{value.id}</td>
                <td>{value.last_name}</td>
                <td>{value.first_name}</td>
                <td>{value.username}</td>
                <td className="text-right">{value.wins}</td>
                <td className="text-center"><EligibleIcon value={value} handleClick={this.eligible}/></td>
                <td className="text-center"><BannedIcon value={value} handleClick={this.bannedReason}/></td>
            </tr>
        );
    }
});


var EligibleIcon = React.createClass({
    render : function() {
        var iconClass = null;
        var title = null;
        if (this.props.value.eligible == '1') {
            iconClass = 'fa-check text-success';
            title = 'Eligible';
        } else {
            iconClass = 'fa-times text-danger';
            title = 'Not eligible';
        }
        return (
            <Icon iconClass={iconClass} handleClick={this.props.handleClick} title={title} />
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
            iconClass = 'fa-ban text-danger';
            title = 'Banned: ' + bannedDate.toLocaleDateString() + "\nReason: " + this.props.value.banned_reason;
        } else {
            iconClass = 'fa-times text-muted';
            title = '';
        }
        return (
            <Icon iconClass={iconClass} handleClick={this.props.handleClick} handleOver={this.hover} title={title} />
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
            nextButton = <button className="btn btn-default" onClick={this.loadStudents.bind(null, nextLimit, this.state.search)}>Add more rows</button>;
        }
        return (
            <div>
                <div className="row">
                    <div className="col-sm-4">
                        <TextInput placeholder={'Search'} handleChange={this.searchRows} handlePress={this.preventSpaces}/>
                    </div>
                </div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Username</th>
                            <th>Wins</th>
                            <th className="text-center">Eligible</th>
                            <th className="text-center">Banned</th>
                        </tr>
                    </thead>
                    <tbody id="studentList">
                        {this.state.students.map(function(value,i){
                            return (
                                <StudentRow key={i} student={value} resetRows={this.loadStudents}/>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
                {nextButton}
            </div>
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
            inputId : null
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
                    onChange={this.props.handleChange} onBlur={this.handleBlur} onKeyPress={this.props.handlePress}/>
            </div>
        );
    }
});

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(<Setup/>, document.getElementById('tailgate-setup'));
