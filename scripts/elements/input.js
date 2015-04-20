
function InputValueRequired (selectors, response) {
	this.selectors = selectors;
	this.response = response

	this.orig_color = {};
	for (each in this.selectors) {
		var el = this.selectors[each];
		this.orig_color[el] = $(el).css ('color');
	}
}

InputValueRequired.prototype.test_required = function (selectors) {
	var ok = true;
	
	if (!selectors) {
		selectors = this.selectors;
	}

	for (each in selectors) {
		var el = selectors[each];
		if ($(el).val () == '') {
			ok = false;
			$(el).css ('color', 'red');
			$(el).val ('required');
			$(el).focus (function (el) {
				$(el).css ('color', this.orig_color[el]);
				$(el).val ('');
				$(el).unbind ('focus');
			}.bind (this, el));
		}
	}

	if (!ok) {
		$(this.response).text ('Error: All fields are required');
	}

	return ok;
}

InputValueRequired.prototype.test_equal = function (selectors) {
	var ok = true;
	
	if (!selectors) {
		selectors = this.selectors;
	}

	var val;

	for (each in selectors) {
		var el = selectors[each];
		var val2 = $(el).val ();
		if (val) {
			if (val != val2) {
				ok = false;
			}
		} else {
			val = val2;
			continue;
		}
	}

	if (!ok) {
		$(this.response).text ('Error: Field values are not equal');
		for (each in selectors) {
			var el = selectors[each];
			$(el).css ('color', 'red');
			$(el).focus (function (selectors) {
				for (each in selectors) {
					var el = selectors[each];
					$(el).css ('color', this.orig_color[el]);
					$(el).unbind ('focus');
				}
			}.bind (this, selectors));
		}
	}

	return ok;
}




