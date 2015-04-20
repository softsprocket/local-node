
function Cookies () {
	var c = document.cookie;
	console.log (c);
	var ca = c.split (';');
	for (each in ca) {
		var key_value = ca[each].split ('=');
		this[key_value[0]] = key_value[1];
	}
}

