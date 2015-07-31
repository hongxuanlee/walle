/**
 * token match rule: when two tokens match token regExp, which one to chose?
 * @author  ddchen
 */

var choseTokenSource = function(tokenSource1, tokenSource2) {
	return doEarliestPrincipe(tokenSource1, tokenSource2);
}
var doChoseToken = function(oldToken, newToken) {
	if (!oldToken) {
		return newToken;
	} else {
		// longest prefix
		if (newToken.left.length > oldToken.left.length) {
			return newToken;
		}
	}
	return oldToken;
}
var doEarliestPrincipe = function(tokenSource1, tokenSource2) {
	if (tokenSource2.before.length < tokenSource1.before.length) {
		return tokenSource2;
	}
	return doLongestPrefixPrincipe(tokenSource1, tokenSource2);
}
var doLongestPrefixPrincipe = function(tokenSource1, tokenSource2) {
	if (tokenSource2.before.length == tokenSource1.before.length) {
		var newPrefixLength = tokenSource2.current.left.length;
		var oldPrefixLength = tokenSource1.current.left.length;
		if (newPrefixLength > oldPrefixLength) {
			return tokenSource2;
		}
	}
	return tokenSource1;
}


module.exports = {
	choseTokenSource: choseTokenSource,
	doChoseToken: doChoseToken
}