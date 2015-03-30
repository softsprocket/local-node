require ('elements/element.js');

function Application () {
	this.elements = {};
	this.methods = [];
}

Application.prototype.add_element = function (element) {
	this.elements[element.selector] = element; 
}

Application.prototype.get_element = function (selector) {
	return this.elements[selector]; 
}

			
