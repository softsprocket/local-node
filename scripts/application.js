require ('elements/login.js');
require ('elements/cookies.js');

var user_login = new Login ();
var user_register = new Register (user_login);

$(function () {
	
	var login_selectors = {
		menu: '#login_nav',
		login: '#user_login',
		logout: '#user_logout',
		name: '#user_name',
		password: '#user_password',
		response: '#user_login_resp'
	};

	user_login.listeners (login_selectors);

	var register_selectors = {
		menu: '#register_nav',
		register: '#user_register',
		name: '#user_reg_name',
		password: '#user_reg_password',
		confirm_password: '#user_reg_confirm_password',
		email: '#user_reg_email',
		response: '#user_register_resp'
	};

	user_register.listeners (register_selectors);


});

