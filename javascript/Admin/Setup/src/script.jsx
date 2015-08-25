var Setup = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    getInitialState: function() {
        return {
            currentTab : 'lots'
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
        }
        return (
            <div>
                <ul className="nav nav-tabs">
                  <li role="presentation" className={this.state.currentTab === 'visitors' ? 'active' : ''} onClick={this.changeTab.bind(null, 'visitors')}><a style={{cursor:'pointer'}}>Visitors</a></li>
                  <li role="presentation" className={this.state.currentTab === 'lots' ? 'active' : ''} onClick={this.changeTab.bind(null, 'lots')}><a style={{cursor:'pointer'}}>Lots</a></li>
                  <li role="presentation" className={this.state.currentTab === 'students' ? 'active' : ''} onClick={this.changeTab.bind(null, 'students')}><a style={{cursor:'pointer'}}>Students</a></li>
                  <li role="presentation" className={this.state.currentTab === 'reports' ? 'active' : ''} onClick={this.changeTab.bind(null, 'reports')}><a style={{cursor:'pointer'}}>Reports</a></li>
                </ul>

                <hr />
                {pageContent}
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
        $.getJSON('tailgate/Admin/Setup/Visitor', {
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
        $.post('tailgate/Admin/Setup/Visitor', {
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
            $.post('tailgate/Admin/Setup/Visitor', {
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
        $.getJSON('tailgate/Admin/Setup/Lot', {
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
                                        <i className={this.state.spotKey === i ? 'fa fa-caret-up' : 'fa fa-caret-down'}></i> Manage Spots
                                    </button>
                                </div>
                                {this.state.spotKey === i ? <Spots lotId={value.id} /> : null}
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
            $.post('tailgate/Admin/Setup/Lot', {
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

        $.getJSON('tailgate/Admin/Setup/Spot', {
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

        var reserved = spot.reserved === '1' ? '0' : '1';

        $.post('tailgate/Admin/Setup/Spot', {
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
                            <th>
                                Number
                            </th>
                            <th>
                                Selected
                            </th>
                            <th>
                                Picked up
                            </th>
                            <th>
                                Reserved
                            </th>
                        </tr>
                        {this.state.spots.map(function(value, i){
                            return (
                                <tr key={i}>
                                    <td>{value.number}</td>
                                    <td>{value.selected}</td>
                                    <td>{value.picked_up}</td>
                                    <td>{value.reserved === '1' ?
                                            <YesButton handleClick={this.toggleReserve.bind(this, i)} label={'Reserved'}/> :
                                                <NoButton handleClick={this.toggleReserve.bind(this, i)} label={'Not reserved'}/>}</td>
                                </tr>
                            );
                        }.bind(this))}
                    </tbody>
                </table>
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

var Students = React.createClass({

    render: function() {
        return (
            <div>Students</div>
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
                    onChange={this.handleChange} onBlur={this.handleBlur} onKeyPress={this.props.handlePress}/>
            </div>
        );
    }
});

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(<Setup/>, document.getElementById('tailgate-setup'));
