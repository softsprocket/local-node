var fs = require ('fs');
var UglifyJS = require ("uglify-js");
var path = require ('path');

function JSMerge (paths) {
	this.str = "";
	this.is_minified = false;
	this.merged_files = [];
	if (paths) {
		this.paths = paths;
	} else {
		this.paths = [];
	}
}

JSMerge.prototype.find_file = function (fname) {
	var text = null;

	for (var i in this.paths) {
		try {
			text = fs.readFileSync (path.join (this.paths[i], fname), { encoding: 'utf8' });
			return text;
		} catch (e) {}
	}

	return text;
}

JSMerge.prototype.add_file = function (fname) {
	if (this.minified) {
		throw Error ("Text is already minified");
	}

	if (this.already_merged (fname)) {
		return;
	}

	var text = this.find_file (fname);

	if (text == null) {
		throw Error ("Unable to find: " + fname);
	}

	this.merged_files.push (fname);

	text = this.resolve_requires (text);
	this.str += text;

}

JSMerge.prototype.already_merged = function (fname) {
	for (var i in this.merged_files) {
		if (this.merged_files[i] == fname) {
			return true;
		}
	}

	return false;
}

JSMerge.prototype.add_files = function (fnames) {
	if (this.minified) {
		throw Error ("Text is already minified");
	}

	for (var i in fnames) {

		if (this.already_merged (fnames[i])) {
			continue;
		}

		var text = this.find_file (fnames[i]);

		if (text == null) {
			throw Error ("Unable to find: " + fnames[i]);
		}

		text = this.resolve_requires (text);
		this.str += text;
	}

}

JSMerge.prototype.resolve_requires = function (str) {

	var re = /require\s*\(\s*'([^']+)'\s*\)\s*;/;

	var m = str.match (re);

	while (m != null) {
		var fname = m[1];
		
		if (this.already_merged (fname)) {
			str = str.replace (m[0], '');
			continue;
		}

		this.merged_files.push (fname);

		var replacement_text = this.find_file (fname);
		
		if (fname == null) {
			throw Error ("Unable to find: " + fname);
		}

		str = str.replace (m[0], replacement_text);
		m = str.match (re);	
	}
	
	return str;
}

JSMerge.prototype.get_text = function () {
	return this.str;
}

JSMerge.prototype.get_text_in_script_tags = function () {
	return '<script>' + this.str + '</script>';
}

JSMerge.prototype.write_file_and_get_script_tag = function (fname, script) {
	fs.writeFileSync (fname, this.str, { encoding: 'utf8' });
	return '<script src="' + script + '"></script>'; 
}

JSMerge.prototype.minify = function () {
	if (this.minified) return;

	console.log (this.str);
	var result = UglifyJS.minify (this.str, { fromString: true });
	this.str = result.code;

	this.minified = true;
}

module.exports = JSMerge;

