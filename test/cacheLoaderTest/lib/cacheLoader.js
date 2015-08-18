var CacheLoader = (function(){var __moduleMap={};var define = function(path,func){__moduleMap[path] = {func:func};};var require = function(path){if(!__moduleMap[path])throw new Error('can not find module:'+path);if(__moduleMap[path].module)return __moduleMap[path].module.exports;var module={exports:{}};__moduleMap[path].func.apply(module, [require,module,module.exports]);__moduleMap[path].module = module;return __moduleMap[path].module.exports;};define('/Users/ddchen/Coding/opensource/walle/lib/cacheLoader/cacheLoader.js', function(require, module, exports){
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
});return require('/Users/ddchen/Coding/opensource/walle/lib/cacheLoader/cacheLoader.js')})();