
var MethodRegistry = require ('./method_registry');

module.exports = function (app, script_tag) {

function home (req, res) {
	res.render ('home',
		{ 
			scripting: script_tag
		}	
	);
}

function about (req, res) {
	res.render ('about',
		{ 
			scripting: script_tag
		}	
	);
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


