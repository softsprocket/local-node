

function Document (obj) {
	if (obj) {
		this.init (obj);
	}
}

Document.prototype.init = function (data) {
	for (each in data) {
		if (data.hasOwnProperty (each)) {
			this[each] = data[each];
		}
	}
}

Document.prototype.data = function () {
	var data = {};

	for (each in this) {
		if (this.hasOwnProperty (each) && typeof this[each] != 'function') {
			data[each] = this[each];
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

