
function SMTPS (address, port) {
	if (!port) {
		this.port = 465;
	} else {
		this.port = port;
	}
}


