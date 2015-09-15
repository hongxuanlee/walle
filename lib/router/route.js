var URL_REG = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/i;
var PageFetcher = require('pageFetch.js');
var pageRender = require('../resRender/resRender.js');

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
		this.fetchPage(url, opt);
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
		pageFetcher.doFetch();
	},
	createPageFetcher: function(url, opt, forward) {
		var that = this;
		var forword = forward || false;
		var pageFetcher = new PageFetcher(url, opt);
		var loadComplete = function() {
			that.fetcherQueue.splice(0, that.fetcherQueue.length);
		}
		pageFetcher.onSuccessLoad(function(data) {
			var pgContext = this;
			loadComplete();
			trigger('pageLoadEnd');
			that.curPageUrl = pgContext.url;
			that.updateHistory(pgContext.url, opt, forword);
			trigger('pageRenderStart');
			var opts = {
				resJson: data,
				domReady: function() {
					trigger('domReady')
				},
				resReady: function() {
					trigger('resourceReady');
				},
				renderDom: function() {
					trigger('renderComplete');
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