var bcrypt = require('bcryptjs');
var crypto = require ('crypto');

function LoginDocument (obj) {
	if (!obj) {
		obj = {
			username: null,
			password: null,
			date: null
		};
	} 

	this.init (obj);
}

LoginDocument.prototype = Object.create (require ('./document').prototype);

LoginDocument.PasswordHashSync = function (password) {
	var salt = bcrypt.genSaltSync (10);
	return bcrypt.hashSync (password, salt);
}

LoginDocument.prototype.password_hash = function () {
	var self = this;
	bcrypt.genSalt (10, function (err, salt) {
		if (err) {
			self.emit ('error', err);
			return;
		}
	
		bcrypt.hash (self.password, salt, function (err, hash) {
			if (err) {
				self.emit ('error', err);
				return;
			}

			self.emit ('password_hash', hash); 	
		});
		
	});
}


LoginDocument.PasswordTest = function (password, hash) {
	return bcrypt.compareSync(password, hash);
}

LoginDocument.prototype.password_test = function (password) {
	var self = this;
	return bcrypt.compare (password, self.password, function (err, res) {
		if (err) {
			self.emit ('error', err);
			return;
		}

		self.emit ('test_password', res);
	});
}

LoginDocument.prototype.generate_secure_string = function (date) {
	var self = this;
	var hmac = crypto.createHmac ('sha512', require ('../credentials/cred').cookie_secret);
	hmac.setEncoding ('base64');

	hmac.end (date + username + hash, function () {
		var h = hmac.read ('base64');
		self.emit ('secure_string', date + ":" + h); 
	});

	hmac.on ('error', function (err) {
		self.emit ('error', err);
	});
}

LoginDocument.prototype.test_secure_string = function (str) {
	var self = this;

	var date = str.split (':')[0];

	var hmac = crypto.createHmac ('sha512', require ('../credentials/cred').cookie_secret);
	hmac.setEncoding ('base64');

	hmac.end (date + username + hash, function () {
		var h = hmac.read ('base64');
		
		var ok = false;
		if (date + ":" + h == str) {
			ok = true;
		}

		self.emit ('secure_string', ok); 
	});

	hmac.on ('error', function (err) {
		self.emit ('error', err);
	});
}

function LoginCollection (db) {
	this.init (db, 'login');
}

LoginCollection.prototype = Object.create (require ('./collection').prototype);

LoginCollection.Document = LoginDocument;

LoginCollection.prototype.find_user = function (name) {
	var self = this;
	this.collection.findOne ({ username: name }, function (err, doc) {
		if (err) {
			self.emit ('error', err);
			return;
		}

		if (doc == null) {
			self.emit ('user', null);
		} else {
			self.emit ('user', new LoginDocument (doc));
		}
	});
}

module.exports = LoginCollection;

