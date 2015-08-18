var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Setup = React.createClass({
    getInitialState: function() {
        return {
            currentTab : 'visitors'
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


var Visitors = React.createClass({
    getInitialState: function() {
        return {
            visitors : [],
            showForm : false
        };
    },

    componentWillMount: function() {
        this.loadVisitors();
    },

    loadVisitors: function() {
        $.getJSON('tailgate/Admin/Setup/Visitor', {
            command : 'list'
        }).done(function(data){
            if (data.length < 1) {
                data = [];
            }
            this.setState({
                visitors : data
            });
        }.bind(this));
    },

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

    removeVisitor : function(index) {
        var visitor = this.state.visitors[index];
        $.post('tailgate/Admin/Setup/Visitor', {
            command : 'remove',
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
                <ul className="list-group">
                    {this.state.visitors.map(function(value, i){
                        var removeClick = this.removeVisitor.bind(this,i);
                        return (
                            <li className="list-group-item" key={i}>
                                <button className="btn btn-sm btn-danger pull-right" onClick={removeClick}>
                                    <i className="fa fa-times"></i> Remove</button> {value.university} - {value.mascot}
                            </li>
                        );
                    }, this)}
                </ul>
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
        var university = React.findDOMNode(this.refs.university).value;
        var mascot = React.findDOMNode(this.refs.mascot).value;

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
                        <label htmlFor="university">University:</label>
                        <input type="text" id="university" className="form-control" ref="university"/>
                    </div>
                    <div className="form-group col-sm-6">
                        <label htmlFor="mascot">Mascot:</label>
                        <input type="text" id="mascot" className="form-control" ref="mascot"/>
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
    render : function() {
        return (
            <div>Lots</div>
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



// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
React.render(<Setup/>, document.getElementById('tailgate-setup'));
