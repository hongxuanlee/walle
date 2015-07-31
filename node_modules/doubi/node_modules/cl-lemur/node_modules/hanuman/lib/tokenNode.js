var TokenNode = function(token) {
	this.token = token;
	this.children = [];
}

TokenNode.prototype = {
	contructor: TokenNode,
	remove: function() {
		if (!this.parent) return;
		var index = this.parent.getChildIndex(this);
		if (index !== undefined) {
			this.parent.children.splice(index, 1);
		}
		this.parent = null;
	},
	append: function(childNode) {
		this.insertChild(childNode, this.children.length);
	},
	prepend: function(childNode) {
		this.insertChild(childNode, 0);
	},
	hasChild: function(childNode) {
		var index = this.getChildIndex(childNode);
		return index !== null;
	},
	replace: function(newNode) {
		if (!(newNode instanceof TokenNode)) return;
		var index = this.parent.getChildIndex(this);
		if (index === null) return;
		this.parent.insertChild(newNode, index);
		this.remove();
	},
	getChildIndex: function(childNode) {
		for (i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if (child == childNode) {
				return i;
			}
		}
		return null;
	},
	insertChild: function(childNode, index) {
		if (this.hasChild(childNode)) {
			throw new Error("append another same node!");
		}
		this.children.splice(index, 0, childNode);
		childNode.parent = this;
	},
	createNode: function(token) {
		return new TokenNode(token);
	}
}

module.exports = TokenNode;