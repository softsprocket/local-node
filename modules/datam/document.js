 

function Document (obj) {
	if (obj) {
		this.init (obj);
	}
}

Document.Clone = function (obj) {
	var copy;

	if (obj instanceof Date) {
		copy = new Date ();
		copy.setTime (obj.getTime ());
		return copy;
	}

	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = Document.Clone (obj[i]);
		}
		return copy;
	}

	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty (attr)) copy[attr] = Document.Clone (obj[attr]);
		}
		return copy;
	}

	throw Error ('unsupported object type');
}

Document.prototype = Object.create(require('events').EventEmitter.prototype);

Document.prototype.init = function (data) {
	for (each in data) {
		if (data.hasOwnProperty (each)) {
			if (typeof data[each] == 'object') {
				this[each] = Document.Clone (data[each]);
			} else {
				this[each] = data[each];
			}
		}
	}
}

Document.prototype.data = function () {
	var data = {};

	for (each in this) {
		if (this.hasOwnProperty (each) && typeof this[each] != 'function') {
			if (typeof data[each] == 'object') {
				data[each] = Document.Clone (this[each]);
			} else {
				data[each] = this[each];
			}
		}
	}

	return data;
}

Document.prototype.to_json = function () {
	return JSON.stringify (this.data ());
}

Document.from_json = function (json) {
	var data = JSON.parse (json);
	var doc = new Document (data);
	return doc;
}

module.exports = Document;

