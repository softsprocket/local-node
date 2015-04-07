var fs = require ('fs');
var handlebars = require ('handlebars');

function Navigation (partial_name) {
	var partial = fs.readFileSync (partial_name, { encoding: 'utf8' });
	this.template = handlebars.compile (partial);
}

Navigation.prototype.html = function (loggedin) {
	var context = { login: loggedin ? 'logout' : 'login' }
	return this.template (context);
}




module.exports = Navigation;
