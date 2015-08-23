/**
 * page resource data structure
 *
 * resJson
 * {
 * 		html: "<div>page1</div>",
 * 		css: ["a.css", "b.css"],
 * 		js: ["a.js", "b.js"],
 * 		script: "alert(1);",
 * 		style:".abc{color:red}",
 * 		async: ["d.js"]
 * }
 *
 * execution sequence：
 *  (1) render style resources, css first then style
 *  (2) render html structure by adding dom fragment to dom tree
 *  (4) load js resources
 *  (5) execute script
 *  (6) at the same time, load async resources
 *
 * opts
 *      resJson
 *      container   <optional>  default is document.body
 *      renderDom  function(html, container, next)
 *      domReady
 *      resReady
 */

var LazyLoad = require("./lazyload.js");

var loadCssStyleResource = function(rm, cb) {
	function loadStyle() {
		if (rm.style) {
			var styleNode = document.createElement('style');
			styleNode.innerHTML = rm.style;
			document.getElementsByTagName('head')[0].appendChild(styleNode);
		}
		cb && cb();
	}
	if (rm.css && rm.css.length) {
		// css first
		LazyLoad.css(rm.css, function() {
			loadStyle();
		});
	} else {
		loadStyle();
	}
}

var loadJsScriptResource = function(rm, cb) {
	if (rm.js && rm.js.length) {
		LazyLoad.js(rm.js, function() {
			rm.script && window.eval(rm.script);
			cb && cb();
		});
	} else {
		rm.script && window.eval(rm.script);
		cb && cb();
	}
}

var renderDom = function(html, opts, cb) {
	var container = opts.container || document.body;
	if (opts.renderDom) {
		opts.renderDom(html, container, function() {
			cb && cb();
		});
	} else {
		container.innerHTML = html;
		cb && cb();
	}
}

module.exports = {
	render: function(opts) {
		opts = opts || {};
		var resJson = opts.resJson;
		var html = resJson.html || "";

		loadCssStyleResource(resJson, function() {
			renderDom(html, opts, function() {
				// when go here, html res showed already.
				opts.domReady && opts.domReady();
				loadJsScriptResource(resJson, function() {
					// resource ready.
					opts.resReady && opts.resReady();
				});
				if (resJson.async) {
					LazyLoad.js(resJson.async);
				}
			});
		});
	}
}