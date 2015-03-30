
function Element (selector) {
	this.selector = selector;
	this.el = document.querySelector (selector);
}

Element.prototype.add_listener = function (type, listener, use_capture) {
	this.el.addEventListener (type, listener, use_capture);
}

Element.prototype.remove_listener  = function (type, listener, use_capture) {
	this.el.removeEventListener (type, listener, use_capture);
}

Element.prototype.dispatch_event  = function (type, options) {
	this.el.dispatchEvent (new Event (type), options);
}

function ElementData (data) {
	for (each in data) {
		if (data.hasOwnProperty (each)) {
			this[each] = data[each];
		}
	}
}

ElementData.prototype.data = function () {
	var data = {};

	for (each in this) {
		if (this.hasOwnProperty (each) && typeof this[each] != 'function') {
			data[each] = this[each];
		}
	}

	return data;
}

ElementData.prototype.to_json = function () {
	return JSON.stringify (this.data ());
}




