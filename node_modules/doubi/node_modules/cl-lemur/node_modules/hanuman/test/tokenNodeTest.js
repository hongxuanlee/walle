var TokenNode = require("../lib/tokenNode.js");
var assert = require("assert");

describe("token node operation", function() {
	it("should init a new node", function() {
		var node = new TokenNode();
		console.log(node);
	});

	it("should init a token node", function() {
		var node = new TokenNode({
			word: "haha!"
		});
		console.log(node);
	});

	it("should add child node by append", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});
		node1.append(node2);
		node1.append(node3);
		console.log(node1.children);
		assert.equal(2, node1.children.length);
	});

	it("should add child node by prepend", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});
		node1.prepend(node2);
		node1.prepend(node3);
		console.log(node1.children);
		assert.equal(2, node1.children.length);
	});

	it("should remove child", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});
		node1.append(node2);
		node1.append(node3);

		node3.remove();
		console.log(node1.children);
		console.log(node3);
		assert.equal(1, node1.children.length);
	});

	it("should have child", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});
		node1.append(node2);
		node1.append(node3);

		assert(true, node1.hasChild(node2));
	});

	it("should get index 2", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});
		node1.append(node2);
		node1.append(node3);

		assert(1, node1.getChildIndex(node3));
	});

	it("should replace node", function() {
		var node1 = new TokenNode({
			word: "node1!"
		});
		var node2 = node1.createNode({
			word: "node2!"
		});
		var node3 = node1.createNode({
			word: "node3!"
		});

		var node4 = node1.createNode({
			word: "node4!"
		});
		var node5 = node1.createNode({
			word: "node5!"
		});
		node1.append(node2);
		node1.append(node3);
		node1.append(node4);
		node3.replace(node5);
		assert(3, node1.children.length);
		assert(1, node1.getChildIndex(node5));
		assert(true, node3.parent === null);
	});

});