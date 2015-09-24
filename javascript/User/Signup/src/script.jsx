Signup = React.createClass({

    checkNames : function(e) {
        var firstName = $('#firstName');
        var lastName = $('#lastName');

        if (firstName.val().length === 0) {
            e.preventDefault();
            firstName.css('border-color', 'red');
            firstName.attr('placeholder', 'Fill in your first name');
        }

        if(lastName.val().length === 0) {
            e.preventDefault();
            lastName.css('border-color', 'red');
            lastName.attr('placeholder', 'Fill in your last name');
        }
    },

    render : function() {
        return (
            <div>
                <p>Before getting started, please enter your first and last name.</p>
                <form method="post" action="tailgate/User/Student">
                    <input type="hidden" name="command" value="createNewAccount" />
                    <div className="row">
                        <div className="col-sm-6">
                            <TextInput inputId="firstName" label={'First name'} required={true}/>
                        </div>
                        <div className="col-sm-6">
                            <TextInput inputId="lastName" label={'Last name'} required={true}/>
                        </div>
                    </div>
                    <div className="text-center" style={{marginTop : '1em'}}>
                        <button className="btn btn-primary" onClick={this.checkNames}><i className="fa fa-check"></i> Create new account</button>
                    </div>
                </form>
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
React.render(<Signup/>, document.getElementById('studentSignup'));
