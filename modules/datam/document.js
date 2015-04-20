var ObjectID = require ('mongodb').ObjectID;

function Document (obj) {
	if (obj) {
		this.init (obj);
	}

	this.schema;
}

Document.Clone = function (obj) {

	if (obj instanceof ObjectID) {
		return ObjectID(obj);
	}

	if (obj instanceof Date) {
		var copy = new Date ();
		copy.setTime (obj.getTime ());
		return copy;
	}

	if (obj instanceof Array) {
		var copy = Document.CopyArray (obj);
		return copy;
	}

	if (obj instanceof Object) {
		var copy = Document.CopyObject (obj);
		return copy;
	}

	console.error ('Clone obj', obj);
	throw Error ('unsupported object type');
}

Document.CopyArray = function (array) {
	var copy = []; 
	for (each in array) {
		if (typeof array[each] == 'object') {
			copy[each] = Document.Clone (array[each]);
		} else {
			copy[each] = array[each];
		}
	}

	return copy;
}

Document.CopyObject = function (obj) {
	var copy = {}; 
	for (each in obj) {
		if (obj.hasOwnProperty (each)) {
			if (typeof obj[each] == 'object') {
				copy[each] = Document.Clone (obj[each]);
			} else {
				copy[each] = obj[each];
			}
		}
	}

	return copy;
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
			if (typeof this.schema[each] == 'undefined') {
				continue;
			}

			if (typeof this[each] == 'object') {
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

module.exports = Document;

