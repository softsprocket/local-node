require ('application.js');

$(function () {
	$("body").append ("<p id='Hello_p'>Hello, World</p>");

	var app = new Application ();
	app.add_element (new Element ("#Hello_p"));
	app.get_element ("#Hello_p").add_listener ('click', function () {
		console.log ("Hello, Console");
	});

	console.log (app.get_element ("#Hello_p"));

	app.get_element ("#Hello_p").dispatch_event ('click');
	
	$('#login_nav').click (function () {
		console.log (this.inner_text);

		return false;
	});

	console.log ($('login_nav'));
});

