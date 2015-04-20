
var LoginCollection = require ('../datam/login_collection');
require ('../../utils/declog');

function LoginRoute (db) {
	console.log (__logd, "initializing login routes");
	this.collection = new LoginCollection (db);
	this.next;

	var self = this;
	this.collection.on ('error', function (err) {
		console.error (__errd, err);
		var e = new Error ();
		e.status = 500;
		self.next (e);
	});
}

LoginRoute.prototype.register = function (req, res, next) {
	this.next = next;
	var data = req.body;
	var self = this;

	this.collection.find_user (data.name);
	this.collection.once ('user', function (user) {
		if (user != null) {
			var err = new Error ();
			err.status = 403;
			next (err);
			return;
		}
		
		var doc = new LoginCollection.Document (data);
		
		doc.password_hash ();
		doc.once ('password_hash', function () {
			doc.date = new Date ();

			var agent = req.headers['user-agent'];

			self.collection.insert (doc.data ());
			self.collection.once ('insert', function (result) {

				doc.generate_secure_string (agent);
				doc.once ('secure_string', function (str) {

					req.session.secure_string = str;
					req.session.name = result.ops[0].name;
					req.session.user_id = result.ops[0]._id;

					var response_obj = {
						name: result.ops[0].name
					};
					
					res.json (response_obj);
				});

			});

		});

		doc.once ('error', function (err) {
			var err = new Error ();
			err.status = 500;
			console.error (__errd, 'next', err);
			next (err);

		});
	});

}

LoginRoute.prototype.login = function (req, res, next) {
	this.next = next;
	var data = req.body;
	var self = this;

	this.collection.find_user (data.name);
	this.collection.once ('user', function (user) {
		if (user == null || !LoginCollection.Document.PasswordTest (data.password, user.password)) {
			var err = new Error ();
			err.status = 404;
			next (err);
			return;
		}

		var agent = req.headers['user-agent'];

		var doc = new LoginCollection.Document (user);
		doc.generate_secure_string (agent);
		doc.once ('secure_string', function (str) {
			req.session.secure_string = str;
			req.session.name = doc.name;
			req.session.user_id = doc._id;

			var response_obj = {
				name: doc.name
			};

			res.json (response_obj);
			res.end ();
		});


		doc.once ('error', function (err) {
			console.error (__errd, err);
			var err = new Error ();
			err.status = 500;
			next (err);
		});
	});
}

LoginRoute.prototype.logout = function (req, res, next) {
	req.session.destroy ();
	res.status = 200;
	res.send ('OK');
}

module.exports = LoginRoute;



