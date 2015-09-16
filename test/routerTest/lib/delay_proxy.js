var proxy = (function(){var __moduleMap={};var define = function(path,func){__moduleMap[path] = {func:func};};var require = function(path){if(!__moduleMap[path])throw new Error('can not find module:'+path);if(__moduleMap[path].module)return __moduleMap[path].module.exports;var module={exports:{}};__moduleMap[path].func.apply(module, [require,module,module.exports]);__moduleMap[path].module = module;return __moduleMap[path].module.exports;};define('/Users/kino/Workspace/walle/lib/cacheLoader/cacheLoader.js', function(require, module, exports){
/**
 * cacheLoader
 *
 * opts
 * 		cacheTime
 * 		maxCacheNum
 *
 * conf
 *      url
 *      success
 *      error
 *      cachable
 *      cacheTime
 *      context
 */

var DEFAULT_CACHE_TIME = 5 * 60 * 1000;
var DEFAULT_MAX_CACHE_NUMBER = 8;

var request = function(opts) {
	var url = opts.url;
	var successHandler = opts.success;
	var errorHandler = opts.error;
	var type = opts.type;
	var rData = opts.data;

	var xhr = new(window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			var resText = xhr.responseText;
			var status = xhr.status;
			if (!resText) {
				errorHandler && errorHandler({
					errNo: 2,
					errMsg: "Response text is empty.",
					errInfo: {
						resText: resText,
						status: status
					}
				});
			} else {
				try {
					var data = JSON.parse(resText);
				} catch (e) {
					successHandler && successHandler(resText);
					return;
				}
				successHandler && successHandler(data);
			}
			xhr = undefined;
		}
	};
	xhr.open(type, url, true);
	xhr.send(rData);
}

/**
 * cacheMap
 *     {
 *        "http://www.baidu.com?pager": {
 *              storeTime: 1439867479602,
 *              resource: res
 *        }
 *     }
 */
var CacheLoader = function(opts) {
	this.cacheTime = DEFAULT_CACHE_TIME;
	this.maxCacheNum = DEFAULT_MAX_CACHE_NUMBER;
	this.cacheMap = {};

	opts = opts || {};
	if (typeof opts.cacheTime === "number") {
		this.cacheTime = opts.cacheTime
	}
	if (typeof opts.maxCacheNum === "number") {
		this.maxCacheNum = opts.maxCacheNum;
	}
}

CacheLoader.prototype = {
	constructor: CacheLoader,
	load: function(conf) {
		var me = this;
		if (!conf || typeof conf !== "object") return;

		var url = conf.url;
		var type = conf.type || "get";
		var rData = conf.data;
		var success = conf.success;
		var error = conf.error;
		var cachable = conf.cachable;
		var cacheTime = conf.cacheTime || this.cacheTime;
		var context = conf.context || this;

		if (cachable && this.isCacheValidable(url, cacheTime)) {
			success && success.apply(context, [this.cacheMap[url].resource]);
		} else {
			if (rData && typeof rData === "object") {
				rData = JSON.stringify(rData);
			}
			request({
				url: url,
				type: type,
				data: rData,
				success: function(resource) {
					success && success.apply(context, [resource]);
					if (cachable) {
						me.cacheResource(url, resource);
					}
				},
				error: function(err) {
					error && error.apply(context, [err]);
				}
			});
		}
	},
	isCacheValidable: function(url, cacheTime) {
		var cache = this.cacheMap[url];
		if (!cache) return false;
		var storeTime = cache.storeTime;
		var curTime = new Date();
		if (curTime.getTime() - storeTime < cacheTime) {
			return true;
		}
		return false;
	},
	cacheResource: function(url, resource) {
		// cache it
		this.cacheMap[url] = {
			storeTime: new Date().getTime(),
			resource: resource
		}
		var count = 0;
		var tmpStoreTime = null;
		var oldestUrl = null;
		for (var url in this.cacheMap) {
			var page = this.cacheMap[url];
			var storeTime = page.storeTime;
			if (tmpStoreTime === null) {
				tmpStoreTime = storeTime;
				oldestUrl = url;
			} else {
				if (tmpStoreTime > storeTime) {
					tmpStoreTime = storeTime;
					oldestUrl = url;
				}
			}
			count++;
		}
		if (count > this.maxCacheNum) {
			this.cacheMap[oldestUrl] = undefined;
			delete this.cacheMap[oldestUrl];
		}
	}
}

module.exports = {
	create: function(opts) {
		var cacheLoader = new CacheLoader(opts);
		return {
			load: function(conf) {
				cacheLoader.load(conf);
			}
		}
	}
}
});define('/Users/kino/Workspace/walle/lib/router/pageFetch.js', function(require, module, exports){
/*
** used to record multiple fetch instance;
 */
var pageLoader = require('/Users/kino/Workspace/walle/lib/cacheLoader/cacheLoader.js').create();

var PageFetcher = function(url, opt) {
	this.url = url;
	this.opt = opt || {};
	this.successLoadAction = this.onSuccessLoad;
	this.onFailLoadAction = this.onFailLoad;
}

PageFetcher.prototype = {
	doIgnore: function() {
		this.successLoadAction = null;
		this.failLoadAction = null;
	},
	onSuccessLoad: function(action) {
		this.successLoadAction = action;
	},
	onFailLoad: function(action) {
		this.failLoadAction = action;
	},
	doFetch: function() {
		var conf = this.opt;
		conf.url = this.url;
		conf.success = this.successLoadAction;
		conf.error = this.onFailLoadAction;
		pageLoader.load(conf);
	}
}

module.exports = PageFetcher;
});define('/Users/kino/Workspace/walle/lib/resRender/lazyload.js', function(require, module, exports){
/*jslint browser: true, eqeqeq: true, bitwise: true, newcap: true, immed: true, regexp: false */

/**
LazyLoad makes it easy and painless to lazily load one or more external
JavaScript or CSS files on demand either during or after the rendering of a web
page.
Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
are not officially supported.
Visit https://github.com/rgrove/lazyload/ for more info.
Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
@module lazyload
@class LazyLoad
@static
*/

var LazyLoad = (function(doc) {
  // -- Private Variables ------------------------------------------------------

  // User agent and feature test information.
  var env,

    // Reference to the <head> element (populated lazily).
    head,

    // Requests currently in progress, if any.
    pending = {},

    // Number of times we've polled to check whether a pending stylesheet has
    // finished loading. If this gets too high, we're probably stalled.
    pollCount = 0,

    // Queued requests.
    queue = {
      css: [],
      js: []
    },

    // Reference to the browser's list of stylesheets.
    styleSheets = doc.styleSheets;

  // -- Private Methods --------------------------------------------------------

  /**
  Creates and returns an HTML element with the specified name and attributes.
  @method createNode
  @param {String} name element name
  @param {Object} attrs name/value mapping of element attributes
  @return {HTMLElement}
  @private
  */
  function createNode(name, attrs) {
    var node = doc.createElement(name),
      attr;

    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        node.setAttribute(attr, attrs[attr]);
      }
    }

    return node;
  }

  /**
  Called when the current pending resource of the specified type has finished
  loading. Executes the associated callback (if any) and loads the next
  resource in the queue.
  @method finish
  @param {String} type resource type ('css' or 'js')
  @private
  */
  function finish(type) {
    var p = pending[type],
      callback,
      urls;

    if (p) {
      callback = p.callback;
      urls = p.urls;

      urls.shift();
      pollCount = 0;

      // If this is the last of the pending URLs, execute the callback and
      // start the next request in the queue (if any).
      if (!urls.length) {
        callback && callback.call(p.context, p.obj);
        pending[type] = null;
        queue[type].length && load(type);
      }
    }
  }

  /**
  Populates the <code>env</code> variable with user agent and feature test
  information.
  @method getEnv
  @private
  */
  function getEnv() {
    var ua = navigator.userAgent;

    env = {
      // True if this browser supports disabling async mode on dynamically
      // created script nodes. See
      // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
      async: doc.createElement('script').async === true
    };

    (env.webkit = /AppleWebKit\//.test(ua)) || (env.ie = /MSIE|Trident/.test(ua)) || (env.opera = /Opera/.test(ua)) || (env.gecko = /Gecko\//.test(ua)) || (env.unknown = true);
  }

  /**
  Loads the specified resources, or the next resource of the specified type
  in the queue if no resources are specified. If a resource of the specified
  type is already being loaded, the new request will be queued until the
  first request has been finished.
  When an array of resource URLs is specified, those URLs will be loaded in
  parallel if it is possible to do so while preserving execution order. All
  browsers support parallel loading of CSS, but only Firefox and Opera
  support parallel loading of scripts. In other browsers, scripts will be
  queued and loaded one at a time to ensure correct execution order.
  @method load
  @param {String} type resource type ('css' or 'js')
  @param {String|Array} urls (optional) URL or array of URLs to load
  @param {Function} callback (optional) callback function to execute when the
    resource is loaded
  @param {Object} obj (optional) object to pass to the callback function
  @param {Object} context (optional) if provided, the callback function will
    be executed in this object's context
  @private
  */
  function load(type, urls, callback, obj, context) {
    var _finish = function() {
        finish(type);
      },
      isCSS = type === 'css',
      nodes = [],
      i, len, node, p, pendingUrls, url;

    env || getEnv();

    if (urls) {
      // If urls is a string, wrap it in an array. Otherwise assume it's an
      // array and create a copy of it so modifications won't be made to the
      // original.
      urls = typeof urls === 'string' ? [urls] : urls.concat();

      // Create a request object for each URL. If multiple URLs are specified,
      // the callback will only be executed after all URLs have been loaded.
      //
      // Sadly, Firefox and Opera are the only browsers capable of loading
      // scripts in parallel while preserving execution order. In all other
      // browsers, scripts must be loaded sequentially.
      //
      // All browsers respect CSS specificity based on the order of the link
      // elements in the DOM, regardless of the order in which the stylesheets
      // are actually downloaded.
      if (isCSS || env.async || env.gecko || env.opera) {
        // Load in parallel.
        queue[type].push({
          urls: urls,
          callback: callback,
          obj: obj,
          context: context
        });
      } else {
        // Load sequentially.
        for (i = 0, len = urls.length; i < len; ++i) {
          queue[type].push({
            urls: [urls[i]],
            callback: i === len - 1 ? callback : null, // callback is only added to the last URL
            obj: obj,
            context: context
          });
        }
      }
    }

    // If a previous load request of this type is currently in progress, we'll
    // wait our turn. Otherwise, grab the next item in the queue.
    if (pending[type] || !(p = pending[type] = queue[type].shift())) {
      return;
    }

    head || (head = doc.head || doc.getElementsByTagName('head')[0]);
    pendingUrls = p.urls.concat();

    for (i = 0, len = pendingUrls.length; i < len; ++i) {
      url = pendingUrls[i];

      if (isCSS) {
        node = env.gecko ? createNode('style') : createNode('link', {
          href: url,
          rel: 'stylesheet'
        });
      } else {
        node = createNode('script', {
          src: url
        });
        node.async = false;
      }

      node.className = 'lazyload';
      node.setAttribute('charset', 'utf-8');

      if (env.ie && !isCSS && 'onreadystatechange' in node && !('draggable' in node)) {
        node.onreadystatechange = function() {
          if (/loaded|complete/.test(node.readyState)) {
            node.onreadystatechange = null;
            _finish();
          }
        };
      } else if (isCSS && (env.gecko || env.webkit)) {
        // Gecko and WebKit don't support the onload event on link nodes.
        if (env.webkit) {
          // In WebKit, we can poll for changes to document.styleSheets to
          // figure out when stylesheets have loaded.
          p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
          pollWebKit();
        } else {
          // In Gecko, we can import the requested URL into a <style> node and
          // poll for the existence of node.sheet.cssRules. Props to Zach
          // Leatherman for calling my attention to this technique.
          node.innerHTML = '@import "' + url + '";';
          pollGecko(node);
        }
      } else {
        node.onload = node.onerror = _finish;
      }

      nodes.push(node);
    }

    for (i = 0, len = nodes.length; i < len; ++i) {
      head.appendChild(nodes[i]);
    }
  }

  /**
  Begins polling to determine when the specified stylesheet has finished loading
  in Gecko. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).
  Thanks to Zach Leatherman for calling my attention to the @import-based
  cross-domain technique used here, and to Oleg Slobodskoi for an earlier
  same-domain implementation. See Zach's blog for more details:
  http://www.zachleat.com/web/2010/07/29/load-css-dynamically/
  @method pollGecko
  @param {HTMLElement} node Style node to poll.
  @private
  */
  function pollGecko(node) {
    var hasRules;

    try {
      // We don't really need to store this value or ever refer to it again, but
      // if we don't store it, Closure Compiler assumes the code is useless and
      // removes it.
      hasRules = !!node.sheet.cssRules;
    } catch (ex) {
      // An exception means the stylesheet is still loading.
      pollCount += 1;

      if (pollCount < 200) {
        setTimeout(function() {
          pollGecko(node);
        }, 50);
      } else {
        // We've been polling for 10 seconds and nothing's happened. Stop
        // polling and finish the pending requests to avoid blocking further
        // requests.
        hasRules && finish('css');
      }

      return;
    }

    // If we get here, the stylesheet has loaded.
    finish('css');
  }

  /**
  Begins polling to determine when pending stylesheets have finished loading
  in WebKit. Polling stops when all pending stylesheets have loaded or after 10
  seconds (to prevent stalls).
  @method pollWebKit
  @private
  */
  function pollWebKit() {
    var css = pending.css,
      i;

    if (css) {
      i = styleSheets.length;

      // Look for a stylesheet matching the pending URL.
      while (--i >= 0) {
        if (styleSheets[i].href === css.urls[0]) {
          finish('css');
          break;
        }
      }

      pollCount += 1;

      if (css) {
        if (pollCount < 200) {
          setTimeout(pollWebKit, 50);
        } else {
          // We've been polling for 10 seconds and nothing's happened, which may
          // indicate that the stylesheet has been removed from the document
          // before it had a chance to load. Stop polling and finish the pending
          // request to prevent blocking further requests.
          finish('css');
        }
      }
    }
  }

  return {

    /**
    Requests the specified CSS URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified, the stylesheets will be loaded in parallel and the callback
    will be executed after all stylesheets have finished loading.
    @method css
    @param {String|Array} urls CSS URL or array of CSS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified stylesheets are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    css: function(urls, callback, obj, context) {
      load('css', urls, callback, obj, context);
    },

    /**
    Requests the specified JavaScript URL or URLs and executes the specified
    callback (if any) when they have finished loading. If an array of URLs is
    specified and the browser supports it, the scripts will be loaded in
    parallel and the callback will be executed after all scripts have
    finished loading.
    Currently, only Firefox and Opera support parallel loading of scripts while
    preserving execution order. In other browsers, scripts will be
    queued and loaded one at a time to ensure correct execution order.
    @method js
    @param {String|Array} urls JS URL or array of JS URLs to load
    @param {Function} callback (optional) callback function to execute when
      the specified scripts are loaded
    @param {Object} obj (optional) object to pass to the callback function
    @param {Object} context (optional) if provided, the callback function
      will be executed in this object's context
    @static
    */
    js: function(urls, callback, obj, context) {
      load('js', urls, callback, obj, context);
    }

  };
})(document);

module.exports = LazyLoad;
});define('/Users/kino/Workspace/walle/lib/resRender/resRender.js', function(require, module, exports){
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

var LazyLoad = require('/Users/kino/Workspace/walle/lib/resRender/lazyload.js');

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
});define('/Users/kino/Workspace/walle/lib/router/route.js', function(require, module, exports){
var URL_REG = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/i;
var PageFetcher = require('/Users/kino/Workspace/walle/lib/router/pageFetch.js');
var pageRender = require('/Users/kino/Workspace/walle/lib/resRender/resRender.js');

var trigger = function(eventName, dataMap) {
	var e = document.createEvent('Events');
	e.initEvent(eventName);
	if (dataMap) {
		for (var propName in dataMap) {
			e[propName] = dataMap[propName];
		}
	}
	document.dispatchEvent(e);
};

var Router = function() {
	this.curPageUrl = this.getCurrentUrl();
	this.fetcherQueue = [];
}

Router.prototype = {
	redirect: function(url, opt) {
		if (!opt) opt = {};
		if (this.getCurrentUrl() === url) {
			return;
		}
		this.fetchPage(url, opt, false);
	},
	forward: function(url, opt) {
		if (!opt) opt = {};
		if (this.getCurrentUrl() === url) {
			return;
		}
		this.fetchPage(url, opt, true);
	},
	getUrl: function(url) {
		if (URL_REG.test(url)) {
			return RegExp.$5 + (RegExp.$6 ? RegExp.$6 : "");
		} else {
			"console" in window && console.error("[url error]:", url);
		}
	},
	getCurrentUrl: function() {
		return this.getUrl(window.location.href);
	},
	fetchPage: function(url, opt, forward) {
		if (!url) return;
		if (!opt) opt = {};
		var that = this;
		var repeat = false;
		var item;
		while (item = that.fetcherQueue.pop()) {
			if (url == item.url && !repeat) {
				repeat = true;
				continue;
			} else {
				item.doIgnore();
			}
		}
		//if fetcher queue has same url,execution queue's fetcher.
		if (repeat) return;
		var pageFetcher = this.createPageFetcher(url, opt, forward);
		that.fetcherQueue.push(pageFetcher);
		trigger('pageLoadStart');
    setTimeout(function(){
      pageFetcher.doFetch();
    },3000);
	},
	createPageFetcher: function(url, opt, forward) {
		var that = this;
		var forword = forward || false;
		var url = url;
		var opt = opt;
		var pageFetcher = new PageFetcher(url, opt);
		var loadComplete = function() {
			that.fetcherQueue.splice(0, that.fetcherQueue.length);
		}
		pageFetcher.onSuccessLoad(function(data) {
			var pgContext = this;
			loadComplete();
			trigger('pageLoadEnd');
			that.curPageUrl = url;
			that.updateHistory(url, forword);
			trigger('pageRenderStart');
			var opts = {
				resJson: data,
				domReady: function() {
					trigger('domReady')
				},
				resReady: function() {
					trigger('resourceReady');
				}
			}
			pageRender.render(opts);
		});
		pageFetcher.onFailLoad(function() {
			trigger('pageLoadEnd');
			trigger('pageLoadFail');
			loadComplete();
		});
		return pageFetcher;
	},
	updateHistory: function(targetUrl, forward) {
		if (this.getCurrentUrl() !== targetUrl) {
			if (forward) {
				window.history.replaceState &&
					window.history.replaceState({}, document.title, targetUrl);
			} else {
				window.history.pushState &&
					window.history.pushState({}, document.title, targetUrl);
			}
		}
	},
	setHref: function(node, url, option) {
		if (!node) return false;
		node.setAttribute('walle-href', url);
		if (!option) return true;
		for (var name in option) {
			node.setAttribute(name, option[name])
		}
		return true;
	}
}

module.exports = Router;
});define('/Users/kino/Workspace/walle/lib/router/proxy.js', function(require, module, exports){
var Route = require('/Users/kino/Workspace/walle/lib/router/route.js');
var WALLE_HREF = "walle-href";
var WALLE_CACHE = "walle-cache";
var WALLE_MODE = "walle-mode";

var route = new Route();
var onPopState = function() {
	var currentUrl = route.getCurrentUrl();
	if (!route.curPageUrl || currentUrl === route.curPageUrl) {
		return;
	}
	route.fetchPage(currentUrl);
}
window.addEventListener('popstate', onPopState, false);

var proxyEvent = ["click"];

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

var eventName;
while (eventName = proxyEvent.shift()) {
	document.addEventListener(eventName, jumpGlobalHandle, false);
}


});return require('/Users/kino/Workspace/walle/lib/router/proxy.js')})();