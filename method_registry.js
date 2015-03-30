
function MethodRegistry (app) {
      	this.app = app;
	this.methods = [];
}	

MethodRegistry.prototype.register = function (methods) {
	if (methods instanceof Array) {
		for(i in methods) {
			this.methods.push (methods[i]);
		}
	} else {
		for(i in arguments) {
			this.methods.push (arguments[i]);
		}
	}
}

MethodRegistry.prototype.execute = function () {
       	for (i in this.methods) {
		var args = [];

		if (this.methods[i].path) {
			args[0] = this.methods[i].path;
		}

		if (this.methods[i].callback instanceof Array) {
			for (ii in this.methods[i].callback) {
				args.push (this.methods[i].callback[ii]);
			}
		} else {
			args.push (this.methods[i].callback);
		}
		console.log (this.methods[i]);
		this.app[this.methods[i].method].apply (this.app, args);
	}
}

module.exports = MethodRegistry;

