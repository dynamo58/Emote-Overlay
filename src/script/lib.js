function log(level, ...data) {
	let prefix;
	switch (level) {
		case -2: prefix = "ERROR   ";break;
		case -1: prefix = "WARNING ";break;
		case  0: prefix = "INFO    ";break;
		case  1: prefix = "SUCCESS ";break;
	}
	if (debug)
		console.log(prefix, ...data);
}

function get_url_vars() {
    let vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (_, key, value) {
        vars[key] = value;
    });
    return vars;
}

function get_url_param(parameter, defaultvalue) {
    let urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1)
        urlparameter = get_url_vars()[parameter];
    return urlparameter;
}