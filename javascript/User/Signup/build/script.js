Signup = React.createClass({displayName: "Signup",

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
            React.createElement("div", null, 
                React.createElement("p", null, "Before getting started, please enter your first and last name."), 
                React.createElement("form", {method: "post", action: "tailgate/User/Student"}, 
                    React.createElement("input", {type: "hidden", name: "command", value: "createNewAccount"}), 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-sm-6"}, 
                            React.createElement(TextInput, {inputId: "firstName", label: 'First name', required: true})
                        ), 
                        React.createElement("div", {className: "col-sm-6"}, 
                            React.createElement(TextInput, {inputId: "lastName", label: 'Last name', required: true})
                        )
                    ), 
                    React.createElement("div", {className: "text-center", style: {marginTop : '1em'}}, 
                        React.createElement("button", {className: "btn btn-primary", onClick: this.checkNames}, React.createElement("i", {className: "fa fa-check"}), " Create new account")
                    )
                )
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
                    onChange: this.handleChange, onBlur: this.handleBlur, onKeyPress: this.props.handlePress})
            )
        );
    }
});


// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
$(window).load(function(){React.render(React.createElement(Signup, null), document.getElementById('studentSignup'));});
