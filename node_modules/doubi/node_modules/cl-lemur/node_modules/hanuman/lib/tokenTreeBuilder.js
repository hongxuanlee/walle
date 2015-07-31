/**
 * @author  ddchen chenjunyu@baidu.com
 * @goal convert token stream to token tree
 */
var TokenNode = require("./tokenNode.js");

var build = function(tokens) {
	var root = new TokenNode();

	var currentParentNode = root;
	for (var i = 0; i < tokens.length; i++) {
		var token = tokens[i];
		var node = new TokenNode(token);
		if (token.block && token.block.type === "start") {
			currentParentNode.append(node);
			currentParentNode = node;
		} else if (token.block && token.block.type === "end") {
			if (typeof token.type !== "undefined" &&
				token.type !== currentParentNode.token.type) {
				throw new Error("End tag is not matching for token " + JSON.stringify(currentParentNode.token));
			}
			currentParentNode.endBlock = node;
			currentParentNode = currentParentNode.parent;
		} else {
			currentParentNode.append(node);
		}
	}
	return root;
};

var addChild = function(parentNode, childNode) {
	if (!parentNode.children) parentNode.children = [];
	parentNode.children.push(childNode);
	childNode.parent = parentNode;
}

module.exports = {
	build: build
};