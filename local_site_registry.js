
var MethodRegistry = require ('./modules/method_registry');
var LoginCollection = require ('./modules/datam/login_collection');
var Navigation = require ('./modules/html/navigation');

var navbar = new Navigation ('views/partials/navbar.handlebars');

function render (res, path, script_tag, logged_in) {
	res.render (path, { 
		scripting: script_tag,
		navigation: navbar.html (logged_in)
	});
}

function secure_render (req, res, path, script_tag) {

	var session = req.session;

	if (session.session_check) {
		var login = new LoginCollection (db);

		login.on ('error', function (err) {
			console.err (path, 'LoginCollection error', err);
			var e = new Error();
			e.status = 500;
			next(e);
		});
		
		login.find_user (session.session_check.username);

		login.on ('user', function (doc) {
			if (doc == null) {
				delete session.session_check;
				console.err ("invalid session.session_check - user null");
				render (res, path, script_tag, false);
			} else {
				doc.test_secure_string (session.session_check.string);

				doc.on ('secure_string', function (ok) {
					render (res, path, script_tag, ok);
				});
			}	

		});

	} else {
		render (res, path, script_tag, false);
	}
}

module.exports = function (app, script_tag, db) {

function home (req, res, next) {
	secure_render (req, res, 'home', script_tag);
}

function about (req, res, next) {
	secure_render (req, res, 'about', script_tag);
}

function err_404 (req, res, next) {
	res.status (404);
	res.render ('404');
}

function err_500 (req, res, next) {
	res.status (500);
	res.render ('500');
}


var registry = new MethodRegistry (app);

registry.register ([
	{ method: 'get', path: '/', callback: home },
	{ method: 'get', path: '/about', callback: about },
	{ method: 'use', callback: err_404 },
	{ method: 'use', callback: err_500 }
]);

registry.execute ();

};


