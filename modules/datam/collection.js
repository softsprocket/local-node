
function Collection (db, name) {
	this.db;
	this.name;
	this.collection;
	this.methods;

	if (db) {
		this.init (db, name);
	}
}

Collection.prototype = Object.create(require('events').EventEmitter.prototype);

Collection.prototype.init = function (db, name) {
	this.db = db;
	this.name = name;
	this.collection = db.collection (name);

	this.methods = [
		"aggregate",
		"bulkWrite",
		"count",
		"createIndex",
		"deleteMany",
		"deleteOne",
		"distinct",
		"drop",
		"dropAllIndexes",
		"dropIndex",
		"ensureIndex",
		"find",
		"findAndModify",
		"findAndRemove",
		"findOne",
		"findOneAndDelete",
		"findOneAndReplace",
		"findOneAndUpdate",
		"geoHaystackSearch",
		"geoNear",
		"group",
		"indexes",
		"indexExists",
		"indexInformation",
		"initializeOrderedBulkOp",
		"initializeUnorderedBulkOp",
		"insert",
		"insertMany"
	];

	var self = this;
	for (each in this.methods) {
		var method = this.methods[each];
		var o = { method: method };
		this[method] = function () {
			var method = this.method;
			var args = [];
			for (var i = 0; i < arguments.length; ++i) {
				args[i] = arguments[i];
			}

			args.push (function (err, result) {
				if (err != null) {
					self.emit ('error', err);
				} else {
					self.emit (method, result);
				}
			});

			self.collection[method].apply (self.collection, args);
		}.bind (o);
	}
}

module.exports = Collection;

