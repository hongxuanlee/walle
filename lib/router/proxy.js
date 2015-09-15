var Route = require('./route.js');
var WALLE_HREF = "walle-href";
var WALLE_CACHE = "walle-cache";
var WALEE_MODE = "walle-mode";

var route = new Route();
var onPopState = function() {
	var currentUrl = router.getCurrentUrl();
	if (!router.curPageUrl || currentUrl === router.curPageUrl) {
		return;
	}
	router.fetchPage(currentUrl);
}
window.addEventListener('popstate', onPopState, false);

var proxyEvent = ["click"];

var jumpGlobalHandle = function(e) {
	var elem = e.target;
	var parent = elem;
	while (parent != document.body) {
		var href = parent.getAttribute(WALEE_HREF);
		if (href) {
			e.stopPropagation();
			e.preventDefault();
			var cache = !!parent.getAttribute(WALLE_CACHE);
			var mode = parent.getAttribute(WALEE_MODE);
			if (mode == "forward") {
				route.forward(WALEE_HREF, {
					cachable: cache
				});
			} else {
				route.redirect(WALEE_HREF, {
					cachable: cache
				});
			}
			return;
		}
		parent = parent.parentNode;
	}
}

var eventName;
while (eventName = proxyEvent.shift()) {
	document.addEventListener(eventName, jumpGlobalHandle, false);
}

