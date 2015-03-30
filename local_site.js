
var debugging_turned_on = false;
var mongo_port = 27017;
var http_port = 3000;

var https_config = null;

/*
 * { 
 * 	"debug": false,
 *	"mongo_port": 27017,
 *	"http_port": 3000,
 *	"https_config": {
 *		"port": 3443,
 *		"private_key": "path/key.pem",
 *		"certificate": "path/cert.pem"
 *	}
 * }
 */

process.argv.forEach(function(val, index, array) {
	if (val.match (/^{.*}$/)) {
		var config_obj = JSON.parse (val);
		console.log (config_obj);

		if (config_obj.debug) {
			debugging_turned_on = config_obj.debug;
		}

		if (config_obj.mongo_port) {
			mongo_port = config_obj.mongo_port;
		}

		if (config_obj.http_port) {
			http_port = config_obj.http_port;
		}

		if (config_obj.https_config) {
			https_config = config_obj.https_config;
		}
	}
});

var express = require ('express');

var JSMerge = require ('./utils/jsmerge');

var scripts = new JSMerge (['./scripts']);
scripts.add_file ('hello.js');

if (!debugging_turned_on) {
	scripts.minify ();
}

var script_tag = scripts.write_file_and_get_script_tag ('./public/js/local_site.min.js', 'js/local_site.min.js');


var mongo_client = require ('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/local_site';
mongo_client.connect (url, function (err, db) {
	if (err != null) {
		console.error ("Failed to connect to mongodb: " + err);
		process.exit (1);
	}

	var app = express ();

	var handlebars = require ('express-handlebars').create ({ defaultLayout: 'main' });
	app.engine ('handlebars', handlebars.engine);
	app.set ('view engine', 'handlebars');

	app.use (express.static (__dirname + '/public'));

	require ('./local_site_registry')(app, script_tag);

	var http = require('http');
	http.createServer(app).listen(http_port);

	if (https_config != null) {
		var https = require('https');
		var private_key  = fs.readFileSync (https_config.private_key, 'utf8');
		var certificate = fs.readFileSync (https_config.certificate, 'utf8');

		var credentials = { key: private_key, cert: certificate };
		https.createServer (credentials, app).listen(https_config.port);
	}

});


