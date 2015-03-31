
function Collection (db, name) {
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

	for (each in this.methods) {
		this.[this.methods[each]] = function () {
			this.collection[this.methods[each]] (arguments, function (err, result) {
				if (err != null) {
					this.emit ('error', err);			
				} else {
					this.emit ('success', result);
				}
			});
			
		}
	}
}

module.exports = Collection;

