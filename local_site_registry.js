
var MethodRegistry = require ('./modules/method_registry');
var LoginCollection = require ('./modules/datam/login_collection');
var Navigation = require ('./modules/html/navigation');
var Login = require ('./modules/html/login');
var LoginRoute = require ('./modules/routes/login');

var navbar = new Navigation ('./views/partials/navbar.handlebars');
var login = new Login ('./views/partials/login.handlebars');

require ('./utils/declog');

function logged_in_user (req, res, next, db) {
	var session = req.session;

	if (session.secure_string) {
		var login = new LoginCollection (db);

		login.once ('error', function (err) {
			console.error (__errd, err);
			var e = new Error();
			e.status = 500;
			next (e);
		});
	
		
		login.find_user_by_id (session.user_id);
		
		login.once ('user_by_id', function (user) {
			if (user == null) {
				var e = new Error();
				e.status = 401;
				next (e);
					
				session.destroy ();
			} else {
				var agent = req.headers['user-agent'];
				var doc = new LoginCollection.Document (user);

				doc.test_secure_string (session.secure_string, agent);

				doc.once ('test_secure_string', function (ok) {
					if (ok) {
						next ();
					} else {
						session.destroy ();
						var e = new Error ();
						e.status = 401;
						next (e);
					}
				});

				doc.once ('error', function (err) {
					console.error (__errd, err);
					var e = new Error ();
					e.status = 500;
					next (e);
				});
			}	

		});


	} else {
		var e = new Error();
		e.status = 401;
		next (e);
	}
}

function has_logged_in_session (req) {
	var session = req.session;
	if (session && session.secure_string) {
		return true;
	}

	return false;
}

function render (res, path, script_tag, logged_in) {
	res.render (path, { 
		scripting: script_tag,
		navigation: navbar.html (logged_in),
		login: login.html ()
	});
}


module.exports = function (app, script_tag, db) {

function home (req, res, next) {
	render (res, 'home', script_tag, has_logged_in_session (req));
}

function about (req, res, next) {
	render (res, 'about', script_tag, has_logged_in_session (req));
}

function err_401 (req, res, next) {
	res.status = 401;
	render (res, '401', script_tag, has_logged_in_session (req));
}

function err_403 (req, res, next) {
	res.status = 403;
	render (res, '403', script_tag, has_logged_in_session (req));
}

function err_404 (req, res, next) {
	res.status = 404;
	render (res, '404', script_tag, has_logged_in_session (req));
}

function err_500 (req, res, next) {
	res.status = 500;
	render (res, '500', script_tag, has_logged_in_session (req));
}

function login_test (req, res, next) {
	logged_in_user (req, res, next, db);
}

function error_handler (err, req, res, next) {
	if (err && err.status) {
		
		switch (err.status) {
			case 401:
				err_401 (req, res, next);
				break;
			case 403:
				err_403 (req, res, next);
				break;
			case 404:
				err_404 (req, res, next);
				break;
			case 500:
				err_500 (req, res, next);
				break;
			default:
				console.error (__errd, 'unhandled error code');
				next ();
		}

	} else {
		console.log (__logd, 'next');
		next ();
	}
};


var registry = new MethodRegistry (app);

var login_route = new LoginRoute (db);


registry.register ([
	{ method: 'get', path: '/', callback: home },
	{ method: 'get', path: '/about', callback: about },
	{ method: 'post', path: '/login', callback: function (req, res, next) { login_route.register (req, res, next); }},
	{ method: 'put', path: '/login', callback: function (req, res, next) { login_route.login (req, res, next); }},
	{ method: 'get', path: '/login', callback: [login_test, function (req, res, next) { login_route.logout (req, res, next); }]},
	{ method: 'use', callback: error_handler },
	{ method: 'use', callback: err_404 }
]);

registry.execute ();

};


