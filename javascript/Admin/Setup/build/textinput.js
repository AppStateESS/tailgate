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
