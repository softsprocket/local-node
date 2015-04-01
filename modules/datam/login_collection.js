var bcrypt = require('bcryptjs');
var crypto = require ('crypto');
var fs = require ('fs');

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

LoginDocument.prototype.password_hash = function (password) {
	var self = this;
	var salt = bcrypt.genSalt (10, function (err, salt) {
		if (err) {
			self.emit ('error', err);
			return;
		}
	
		bcrypt.hash (password, salt, function (err, hash) {
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

LoginDocument.prototype.password_test = function (password, hash) {
	var self = this;
	return bcrypt.compare (password, hash, function (err, res) {
		if (err) {
			self.emit ('error', err);
			return;
		}

		self.emit ('test_password', res);
	});
}

LoginDocument.GenerateSecureString = function (hash, username) {
	var hmac = crypto.createHmac ('sha512', require ('../credentials/cred').cookie_secret);
	hmac.update (username);
	return hmac.digest ('base64');
}

LoginDocument.prototype.generate_secure_string = function (hash, username) {
	var self = this;
	var hmac = crypto.createHmac ('sha512', require ('../credentials/cred').cookie_secret);
	hmac.setEncoding ('base64');

	hmac.end (username, function () {
		var hash = hmac.read ('base64');
		self.emit ('secure_string', hash); 
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

module.exports = LoginCollection;

