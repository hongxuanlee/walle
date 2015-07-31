/*****************************************************************************
 * @author  ddchen chenjunyu@baidu.com
 * @goal universe lexical parser
 * 
 ******************************************************************************/
var tokenMatchRule = require("./tokenMatchRule.js");
var tokenTreeBuilder = require("./tokenTreeBuilder.js");

var TokenSpliter = function(tokenGrammers, config) {
	if (!config) config = {};
	if (!config.defaultType) config.defaultType = "text";
	if (!tokenGrammers) tokenGrammers = [];
	this.tokenGrammers = tokenGrammers;
	this.config = config;
}
TokenSpliter.prototype = {
	buildTokenTree: function(source) {
		var tokens = this.parse(source);
		var tree = tokenTreeBuilder.build(tokens);
		return tree;
	},
	parse: function(source) {
		source = source.replace(new RegExp("[\\r\\t\\n]", "g"), "");
		var tokens = [];
		var next = source;
		while (next) {
			var sperateResult = this.separete(next);
			next = sperateResult.next;
			if (sperateResult.before) {
				tokens.push(sperateResult.before);
			}
			if (sperateResult.current) {
				tokens.push(sperateResult.current);
			}
		}
		return tokens;
	},
	separete: function(source) {
		var splitedSource = this.splitSource(source);
		if (!splitedSource) splitedSource = {};
		splitedSource.before = this.wrapNormalToken(splitedSource.before);
		return splitedSource;
	},
	splitSource: function(source) {
		var result = null;
		for (var i = 0; i < this.tokenGrammers.length; i++) {
			var grammerReg = this.getTokenReg(this.tokenGrammers[i]);
			var tokenSource = this.splitSourceByTokenReg(source, grammerReg);
			if (!result || !result.current) {
				result = tokenSource;
			} else if (tokenSource && tokenSource.current) {
				result = tokenMatchRule.choseTokenSource(result, tokenSource);
			}
		}
		return result;
	},
	getTokenReg: function(tokenGrammer) {
		var regStr = tokenGrammer.leftDelimiter + tokenGrammer.wordReg + tokenGrammer.rightDelimiter;
		var grammerReg = new RegExp(regStr);
		return grammerReg;
	},
	splitSourceByTokenReg: function(source, tokenReg) {
		var parts = this.splitByReg(source, tokenReg);
		parts.current = this.wrapGrammarToken(parts.current);
		return parts;
	},
	splitByReg: function(source, tokenReg) {
		var arr = tokenReg.exec(source);
		if (arr) {
			var before = source.substring(0, arr["index"]);
			var current = arr[0];
			var next = source.substring(arr["index"] + arr[0].length);
		} else {
			var before = source;
		}
		return {
			before: before,
			current: current,
			next: next
		}
	},
	wrapNormalToken: function(normal) {
		if (!normal) return null;
		normal = normal.trim();
		if (!normal) return null;
		return {
			type: this.config.defaultType,
			word: normal
		}
	},
	wrapGrammarToken: function(grammarText) {
		if (!grammarText) return null;
		var token = null;
		for (var i = 0; i < this.tokenGrammers.length; i++) {
			var tokenGrammer = this.tokenGrammers[i];
			var grammerReg = this.getTokenReg(tokenGrammer);
			var arr = grammerReg.exec(grammarText);
			if (arr !== null) {
				var temp = this.assembleToken(tokenGrammer, grammarText);
				token = tokenMatchRule.doChoseToken(token, temp);
			}
		}
		return token;
	},
	assembleToken: function(tokenGrammer, grammarText) {
		var leftParts = this.splitByReg(grammarText, new RegExp(tokenGrammer.leftDelimiter));
		var grammarText = leftParts.next;
		var rightParts = this.splitByReg(grammarText, new RegExp(tokenGrammer.rightDelimiter));
		var word = rightParts.before;
		var left = leftParts.current;
		var right = rightParts.current;
		var token = {};
		for (var name in tokenGrammer) {
			token[name] = tokenGrammer[name];
		}
		token.left = leftParts.current;
		token.right = rightParts.current;
		token.word = word;
		return token;
	}
}
module.exports = TokenSpliter;