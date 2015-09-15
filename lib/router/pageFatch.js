/*
** used to record multiple fetch instance;
 */
var pageLoader = require('../cacheLoader/cacheLoader.js').create();

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