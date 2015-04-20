require ('./utils/declog');

function terminate (sig) {
	if (typeof sig === "string") {
		console.log ('%s: Received %s - terminating', Date (Date.now ()), sig);
		process.exit (1);
	}

	console.log('%s: Node server stopped.', Date(Date.now()) );
}

process.on('exit', function() { terminate (); });

[ 
	'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach (function (element, index, array) {
	process.on(element, function() { terminate (element); });
});

var debugging_turned_on = false;
var mongo_url = 'mongodb://localhost:27017/local_site';
var http_port = 3000;

var https_config = null;

/*
 * { 
 * 	"debug": false,
 *	"mongo_url": 'mongodb://localhost:27017/local_site',
 *	"http_port": 3000,
 *	"https_config": {
 *		"port": 3443,
 *		"private_key": "path/key.pem",
 *		"certificate": "path/cert.pem"
 *	}
 * }
 */

var fs = require ('fs');
var conf = fs.readFileSync ("config.json", 'utf8');

var config_obj = JSON.parse (conf);
console.log (__logd, config_obj);

if (config_obj.debug) {
	debugging_turned_on = config_obj.debug;
}

if (config_obj.mongo_url) {
	mongo_url = config_obj.mongo_url;
}

if (config_obj.http_port) {
	http_port = config_obj.http_port;
}

if (config_obj.https_config) {
	https_config = config_obj.https_config;
}


var express = require ('express');

var JSMerge = require ('./utils/jsmerge');

var scripts = new JSMerge (['./scripts']);
scripts.add_file ('application.js');

if (!debugging_turned_on) {
	scripts.minify ();
}

var script_tag = scripts.write_file_and_get_script_tag ('./public/js/local_site.min.js', 'js/local_site.min.js');

var mongo_client = require ('mongodb').MongoClient;
mongo_client.connect (mongo_url, function (err, db) {
	if (err != null) {
		console.error (__errd, "Failed to connect to mongodb: " + err);
		process.exit (1);
	}

	var app = express ();

	app.use (function (req, res, next) {
		if (https_config != null && !req.secure) {
			var u = req.get ('Host').split (':')[0];
			var forward_to = ['https://', [u, https_config.port].join (':'), req.url].join ('');
			return res.redirect (forward_to);
		}

		next ();
	});

	var handlebars = require ('express-handlebars').create ({ defaultLayout: 'main' });
	app.engine ('handlebars', handlebars.engine);
	app.set ('view engine', 'handlebars');

	app.use (express.static (__dirname + '/public'));
	
	var bodyParser = require ('body-parser');
	app.use (bodyParser.json ());
	app.use (bodyParser.urlencoded ({ extended: false }));

	var session = require ('express-session');
 	var MongoStore = require ('connect-mongo') (session);
 	app.use (session ({
 		store: new MongoStore ({ db: db }),
		genid: function(req) {
		      return require ('uuid').v4 () 
		},
		secret: require ('./credentials/cred').session_secret,
		resave: false,
		saveUninitialized: false	
	}));

	require ('./local_site_registry')(app, script_tag, db);

	var http = require ('http');
	http.createServer (app).listen (http_port);

	if (https_config != null) {
		var https = require ('https');
		
		var private_key  = fs.readFileSync (https_config.key, 'utf8');
		var certificate = fs.readFileSync (https_config.cert, 'utf8');

		var credentials = { key: private_key, cert: certificate };
		https.createServer (credentials, app).listen (https_config.port);
	}

});



