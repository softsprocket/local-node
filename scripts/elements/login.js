require ('elements/input.js');

var set_login_callback = $.Callbacks ();

function Register (login) {
	this.login = login;
}

Register.prototype.listeners = function (selectors) {
	var self = this;

	set_login_callback.add (function (loggedin) {
		if (loggedin) { 
			$(selectors.register).hide ();
			$(selectors.menu).hide ();
		} else {
			$(selectors.menu).show ();
		}
	});

	var input_values = new InputValueRequired ([selectors.name, selectors.password, selectors.email, selectors.confirm_password], selectors.response);

	$(selectors.menu).click (function () {
		$(selectors.register).css ('display') == 'none' ?
			$(selectors.register).show ():
			$(selectors.register).hide ();

		return false;
	});

	$(selectors.register).submit (function (event) {
		event.preventDefault ();
	
		if (!input_values.test_required () || !input_values.test_equal ([selectors.password, selectors.confirm_password])) {
			return;
		}

		var send_data = {
            		'name': $(selectors.name).val (),
	            	'password': $(selectors.password).val (),
			'email': $(selectors.email).val ()
	        };
		
			
		console.log ("send_data", send_data);

		$.ajax ({
			type : 'POST',
			url: '/login',
			data: send_data, 
			dataType: 'json', 
			encode: true
		}).done (function (data) {
			console.log (data); 
			self.login.name = data.name;
			set_login_callback.fire (true);
			
		}).fail (function (err) {
			if (err.status == 403) {
				$(selectors.response).text ('User ' + send_data.name + ' already exists');
			} else {
				$(selectors.response).text ('!' + err.status + ' ' + err.statusText);
			}
		});

	});
}

function Login () {
	this.name;
}

Login.prototype.listeners = function (selectors) {
	var self = this;

	set_login_callback.add (function (loggedin) {
		if (loggedin) {
			$(selectors.login).hide ();
			$(selectors.menu).text ('logout');
		} else { 
			$(selectors.logout).hide ();
			$(selectors.menu).text ('login');
		}
	});

	var input_values = new InputValueRequired ([selectors.name, selectors.password], selectors.response);
	
	$(selectors.menu).click (function () {
		if ($(selectors.menu).text () == 'login') {
			$(selectors.login).css ('display') == 'none' ?
				$(selectors.login).show ():
				$(selectors.login).hide ();
		} else {
			$(selectors.logout).show ();
		}

		return false;
	});


	$(selectors.login).submit (function (event) {
		event.preventDefault ();
	
		if (!input_values.test_required ()) {
			return;
		}

		var login_data = {
            		'name': $(selectors.name).val (),
	            	'password': $(selectors.password).val ()
	        };

		$.ajax ({
			type : 'PUT',
			url: '/login',
			data: login_data, 
			dataType: 'json', 
			encode: true
		}).done (function (data) {
			console.log (data); 
			self.name = data.name;		
			set_login_callback.fire (true);
		}).fail (function (err) {
			if (err.status == 404) {
				$(selectors.response).text ('User ' + login_data.name + ' ' + err.statusText);
			} else {
				$(selectors.response).text (err.status + ' ' + err.statusText);
			}
		});

	});

	$(selectors.logout).submit (function (event) {
		event.preventDefault ();

		$.ajax ({
			type: 'GET',
			url: 'login'
		}).done (function () {
			console.log ('logout ok');
			set_login_callback.fire (false);
		}).fail (function (err) {
			$(selectors.response).text (err.status + ' ' + err.statusText);
		});
	});
}


