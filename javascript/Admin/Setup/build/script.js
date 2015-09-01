var Setup = React.createClass({displayName: "Setup",
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
            pageContent = React.createElement(Visitors, null);
            break;

            case 'lots':
            pageContent = React.createElement(Lots, null);
            break;

            case 'students':
            pageContent = React.createElement(Students, null);
            break;

            case 'reports':
            pageContent = React.createElement(Reports, null);
            break;

            case 'content':
            pageContent = React.createElement(Content, null);
            break;
        }
        return (
            React.createElement("div", null, 
                React.createElement("ul", {className: "nav nav-tabs"}, 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'visitors' ? 'active' : '', onClick: this.changeTab.bind(null, 'visitors')}, React.createElement("a", {style: {cursor:'pointer'}}, "Visitors")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'lots' ? 'active' : '', onClick: this.changeTab.bind(null, 'lots')}, React.createElement("a", {style: {cursor:'pointer'}}, "Lots")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'students' ? 'active' : '', onClick: this.changeTab.bind(null, 'students')}, React.createElement("a", {style: {cursor:'pointer'}}, "Students")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'reports' ? 'active' : '', onClick: this.changeTab.bind(null, 'reports')}, React.createElement("a", {style: {cursor:'pointer'}}, "Reports")), 
                  React.createElement("li", {role: "presentation", className: this.state.currentTab === 'content' ? 'active' : '', onClick: this.changeTab.bind(null, 'content')}, React.createElement("a", {style: {cursor:'pointer'}}, "Content"))
                ), 

                React.createElement("hr", null), 
                pageContent
            )
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

var Visitors = React.createClass({displayName: "Visitors",
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
                            return (
                                React.createElement("tr", {key: i}, 
                                    React.createElement("td", null, 
                                    React.createElement("button", {className: "btn btn-sm btn-danger pull-right", onClick: removeClick}, 
                                        React.createElement("i", {className: "fa fa-times"}), " Remove"), " ", value.university, " - ", value.mascot
                                    )
                                )
                            );
                        }, this)
                    )
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
            lotForm = React.createElement(LotForm, {closeForm: this.hideForm, loadLots: this.loadLots});
        } else {
            lotForm = null;
        }
        return (
            React.createElement("div", null, 
                React.createElement("p", null, React.createElement("button", {className: "btn btn-success", onClick: this.showForm}, React.createElement("i", {className: "fa fa-plus"}), " Add Tailgating Lot")), 
                lotForm, 
                React.createElement(LotListing, {lots: this.state.lots})
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

    render : function() {
        return (
            React.createElement("div", null, 
                this.props.lots.map(function(value, i){
                    return (
                        React.createElement("div", {className: "panel panel-default", key: i}, 
                            React.createElement("div", {className: "panel-body row"}, 
                                React.createElement("div", {className: "col-sm-6"}, value.title), 
                                React.createElement("div", {className: "col-sm-3"}, React.createElement("strong", null, "Total spots:"), " ", value.total_spots), 
                                React.createElement("div", {className: "col-sm-3"}, 
                                    React.createElement("button", {className: "btn btn-primary btn-sm", onClick: this.manageSpots.bind(this, i)}, 
                                        "Manage Spots ", React.createElement("i", {className: this.state.spotKey === i ? 'fa fa-caret-up' : 'fa fa-caret-down'})
                                    )
                                ), 
                                this.state.spotKey === i ? React.createElement(Spots, {lotId: value.id, close: this.resetSpots}) : null
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
            return React.createElement(Waiting, null);
        }
        return (
            React.createElement("div", null, 
                React.createElement("table", {className: "table table-striped"}, 
                    React.createElement("tbody", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, 
                                "Number"
                            ), 
                            React.createElement("th", null, 
                                "Selected"
                            ), 
                            React.createElement("th", null, 
                                "Picked up"
                            ), 
                            React.createElement("th", null, 
                                "Reserved"
                            )
                        ), 
                        this.state.spots.map(function(value, i){
                            return (
                                React.createElement("tr", {key: i}, 
                                    React.createElement("td", null, value.number), 
                                    React.createElement("td", null, value.selected === '1' ? React.createElement(YesIcon, null) : React.createElement(NoIcon, null)), 
                                    React.createElement("td", null, value.picked_up === '1' ? React.createElement(YesIcon, null) : React.createElement(NoIcon, null)), 
                                    React.createElement("td", null, value.reserved === '1' ?
                                            React.createElement(YesButton, {handleClick: this.toggleReserve.bind(this, i), label: 'Reserved'}) :
                                                React.createElement(NoButton, {handleClick: this.toggleReserve.bind(this, i), label: 'Not reserved'}))
                                )
                            );
                        }.bind(this))
                    )
                ), 
                React.createElement("div", {className: "text-center"}, React.createElement("button", {className: "btn btn-sm btn-danger", onClick: this.props.close}, React.createElement("i", {className: "fa fa-times"}), " Close spot listing"))
            )
        );
    }
});


var YesIcon = React.createClass({displayName: "YesIcon",
        render : function () {
            return (
                React.createElement("i", {className: "text-success fa fa-check fa-lg"})
            );
        }
});

var NoIcon = React.createClass({displayName: "NoIcon",
        render : function () {
            return (
                React.createElement("i", {className: "text-danger fa fa-times fa-lg"})
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

var Waiting = React.createClass({displayName: "Waiting",
    render : function() {
        return (
            React.createElement("div", {className: "text-center"}, React.createElement("i", {className: "fa fa-cog fa-spin"}), " Loading...")
        );
    }
});

var Students = React.createClass({displayName: "Students",

    render: function() {
        return (
            React.createElement("div", null, "Students")
        );
    }
});

var Reports = React.createClass({displayName: "Reports",

    render: function() {
        return (
            React.createElement("div", null, "Reports")
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

// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(React.createElement(Setup, null), document.getElementById('tailgate-setup'));
