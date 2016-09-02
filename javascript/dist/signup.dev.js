/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!************************************!*\
  !*** ./javascript/User/Signup.jsx ***!
  \************************************/
/***/ function(module, exports) {

	'use strict';
	
	Signup = React.createClass({
	    displayName: 'Signup',
	
	
	    checkNames: function checkNames(e) {
	        var firstName = $('#firstName');
	        var lastName = $('#lastName');
	
	        if (firstName.val().length === 0) {
	            e.preventDefault();
	            firstName.css('border-color', 'red');
	            firstName.attr('placeholder', 'Fill in your first name');
	        }
	
	        if (lastName.val().length === 0) {
	            e.preventDefault();
	            lastName.css('border-color', 'red');
	            lastName.attr('placeholder', 'Fill in your last name');
	        }
	    },
	
	    render: function render() {
	        return React.createElement(
	            'div',
	            null,
	            React.createElement(
	                'p',
	                null,
	                'Before getting started, please enter your first and last name.'
	            ),
	            React.createElement(
	                'form',
	                { method: 'post', action: 'tailgate/User/Student' },
	                React.createElement('input', { type: 'hidden', name: 'command', value: 'createNewAccount' }),
	                React.createElement(
	                    'div',
	                    { className: 'row' },
	                    React.createElement(
	                        'div',
	                        { className: 'col-sm-6' },
	                        React.createElement(TextInput, { inputId: 'firstName', label: 'First name', required: true })
	                    ),
	                    React.createElement(
	                        'div',
	                        { className: 'col-sm-6' },
	                        React.createElement(TextInput, { inputId: 'lastName', label: 'Last name', required: true })
	                    )
	                ),
	                React.createElement(
	                    'div',
	                    { className: 'text-center', style: { marginTop: '1em' } },
	                    React.createElement(
	                        'button',
	                        { className: 'btn btn-primary', onClick: this.checkNames },
	                        React.createElement('i', { className: 'fa fa-check' }),
	                        ' Create new account'
	                    )
	                )
	            )
	        );
	    }
	});
	
	var TextInput = React.createClass({
	    displayName: 'TextInput',
	
	    getDefaultProps: function getDefaultProps() {
	        return {
	            label: '',
	            placeholder: '',
	            handleBlur: null,
	            required: false,
	            handlePress: null,
	            inputId: null
	        };
	    },
	
	    handleBlur: function handleBlur(e) {
	        if (this.props.required && e.target.value.length < 1) {
	            $(e.target).css('border-color', 'red');
	        }
	        if (this.props.handleBlur) {
	            this.props.handleBlur(e);
	        }
	    },
	
	    handleFocus: function handleFocus(e) {
	        $(e.target).css('border-color', '');
	    },
	
	    render: function render() {
	        var label = '';
	        var required = '';
	        if (this.props.label.length > 0) {
	            if (this.props.required) {
	                required = React.createElement('i', { className: 'fa fa-asterisk text-danger' });
	            }
	            label = React.createElement(
	                'label',
	                { htmlFor: this.props.inputId },
	                this.props.label
	            );
	        } else {
	            label = null;
	        }
	        return React.createElement(
	            'div',
	            { className: 'form-group' },
	            label,
	            ' ',
	            required,
	            React.createElement('input', { type: 'text', className: 'form-control', id: this.props.inputId,
	                name: this.props.inputId, placeholder: this.props.placeholder, onFocus: this.handleFocus,
	                onChange: this.handleChange, onBlur: this.handleBlur, onKeyPress: this.props.handlePress })
	        );
	    }
	});
	
	// This script will not run after compiled UNLESS the below is wrapped in $(window).load(function(){...});
	React.render(React.createElement(Signup, null), document.getElementById('studentSignup'));

/***/ }
/******/ ]);
//# sourceMappingURL=signup.dev.js.map