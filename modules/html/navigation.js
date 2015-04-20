var fs = require ('fs');
var handlebars = require ('handlebars');

function Navigation (partial_name) {
	var partial = fs.readFileSync (partial_name, { encoding: 'utf8' });
	this.template = handlebars.compile (partial);
}

Navigation.prototype.html = function (loggedin) {
	var show_register = !loggedin;
	var context = { 
		login: loggedin ? 'logout' : 'login', 
		register: show_register
	};

	return this.template (context);
}




module.exports = Navigation;
