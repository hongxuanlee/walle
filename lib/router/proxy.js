/**
 * to proxy html tag click,and monitor back button.
 */

var WALLE_HREF = "walle-href";
var WALLE_CACHE = "walle-cache";
var WALLE_MODE = "walle-mode";
var proxyEvent = ["click"];

var Route = require('./route.js');
var route = new Route();

var onPopState = function() {
	var currentUrl = route.getCurrentUrl();
	if (!route.curPageUrl || currentUrl === route.curPageUrl) {
		return;
	}
	route.fetchPage(currentUrl);
}
window.addEventListener('popstate', onPopState, false);


var jumpGlobalHandle = function(e) {
	var elem = e.target;
	var parent = elem;
	while (parent != document.body && parent != document.documentElement) {
		var href = parent.getAttribute(WALLE_HREF);
		if (href) {
			e.stopPropagation();
			e.preventDefault();
			var cache = !!parent.getAttribute(WALLE_CACHE);
			var mode = parent.getAttribute(WALLE_MODE);
			if (mode == "forward") {
				route.forward(href, {
					cachable: cache
				});
			} else {
				route.redirect(href, {
					cachable: cache
				});
			}
			return;
		}
		parent = parent.parentNode;
	}
}

while (var eventName = proxyEvent.shift()) {
	document.addEventListener(eventName, jumpGlobalHandle, false);
}