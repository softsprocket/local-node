var bcrypt = require('bcryptjs');
var crypto = require ('crypto');
var ObjectID = require ('mongodb').ObjectID;


function LoginDocument (obj) {
	this.schema = {
		_id: null,
		name: null,
		password: null,
		email: null,
		date: null,
	};

	if (!obj) {
		this.init (this.schema);
	} else {
		this.init (obj);
	}
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
			
			self.password = hash;
			self.emit ('password_hash'); 	
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

LoginDocument.prototype.generate_secure_string = function (agent) {
	var self = this;
	var hmac = crypto.createHmac ('sha512', require ('../../credentials/cred').cookie_secret);
	hmac.setEncoding ('base64');

	hmac.end (agent + this.name + this.password, function () {
		var h = hmac.read ('base64');
		self.emit ('secure_string', h); 
	});

	hmac.once ('error', function (err) {
		self.emit ('error', err);
	});
}

LoginDocument.prototype.test_secure_string = function (str, agent) {
	var self = this;

	var date = str.split (':')[0];

	var hmac = crypto.createHmac ('sha512', require ('../../credentials/cred').cookie_secret);
	hmac.setEncoding ('base64');

	hmac.end (agent + this.name + this.password, function () {
		var h = hmac.read ('base64');
		
		var ok = false;
		if (h == str) {
			ok = true;
		}

		self.emit ('test_secure_string', ok); 
	});

	hmac.once ('error', function (err) {
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
	this.collection.findOne ({ name: name }, function (err, doc) {
		if (err) {
			self.emit ('error', err);
			return;
		}

		if (doc == null) {
			self.emit ('user', null);
		} else {
			self.emit ('user', doc);
		}
	});
}

LoginCollection.prototype.find_user_by_id = function (id) {

	var self = this;
	this.collection.findOne ({ _id: new ObjectID (id) }, function (err, doc) {

		if (err) {
			self.emit ('error', err);
			return;
		}

		if (doc == null) {
			self.emit ('user_by_id', null);
		} else {
			self.emit ('user_by_id', doc);
		}
	});
}

module.exports = LoginCollection;

