
var fs = require ('fs');
var handlebars = require ('handlebars');

function Login (partial_name) {
	this.partial = fs.readFileSync (partial_name, { encoding: 'utf8' });
	//this.template = handlebars.compile (partial);
}

Login.prototype.html = function () {
	//var context = {}
	//return this.template (context);
	return this.partial;
}

module.exports = Login;
