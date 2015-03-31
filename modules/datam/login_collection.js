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

LoginDocument.PasswordHash = function (password) {
	var salt = bcrypt.genSaltSync(10);
	return bcrypt.hashSync(password, salt);
}

LoginDocument.TestHashedPassword = function (password, hash) {
	return bcrypt.compareSync(password, hash);
}

LoginDocument.GenerateSecureString = function (hash, username) {
	var hmac = crypto.createHmac ('sha512', require ('../credentials/cred').cookie_secret);
	hmac.update (username);
	return hmac.digest ('base64');
}

function LoginCollection (db) {
	this.init (db, 'login');
}

LoginCollection.prototype = Object.create (require ('./collection').prototype);

LoginCollection.Document = LoginDocument;

module.exports = LoginCollection;

