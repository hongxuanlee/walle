var TokenSpliter = require("../index.js");
var fs = require("fs");
var path = require("path");
var assert = require("assert");

it('should get token stream', function() {
	var _left = "<#";
	var _right = "#>";
	var tokenSpliter = new TokenSpliter([{
		leftDelimiter: _left,
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "interpolate"
	}, {
		leftDelimiter: _left + "=",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "evaluate"
	}, {
		leftDelimiter: _left + "!",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "selfTagStart"
	}, {
		leftDelimiter: _left + "/",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "selfTagEnd"
	}]);

	var source = fs.readFileSync(path.join(__dirname, "./testTmpl/test1.tmpl"), "utf-8");
	var tokens = tokenSpliter.parse(source);
	console.log(tokens);
});

it('should get token stream', function() {
	var _left = "<#";
	var _right = "#>";
	var tokenSpliter = new TokenSpliter([{
		leftDelimiter: _left + "\\s*widget(?=(" + _right + ")|\\s)",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "widget",
		block: {
			type: "start"
		}
	}]);
	var source = fs.readFileSync(path.join(__dirname, "./testTmpl/test2.tmpl"), "utf-8");
	var tokens = tokenSpliter.parse(source);
	console.log(tokens);
});

it('should get token tree', function() {
	var _left = "<#";
	var _right = "#>";
	var tokenSpliter = new TokenSpliter([{
		leftDelimiter: _left + "b1",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b1",
		block: {
			type: "start"
		}
	}, {
		leftDelimiter: _left + "\\/b1",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b1",
		block: {
			type: "end"
		}
	}, {
		leftDelimiter: _left + "b2",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b2",
		block: {
			type: "start"
		}
	}, {
		leftDelimiter: _left + "\\/b2",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b2",
		block: {
			type: "end"
		}
	}]);
	var source = fs.readFileSync(path.join(__dirname, "./testTmpl/test3.tmpl"), "utf-8");
	var tree = tokenSpliter.buildTokenTree(source);
	assert.equal(tree.children.length, 3);
	assert.equal(tree.children[1].children.length, 2);
	assert.equal(tree.children[2].children.length, 1);
});


it('should fail for unclosure nodes', function(done) {
	var _left = "<#";
	var _right = "#>";
	var tokenSpliter = new TokenSpliter([{
		leftDelimiter: _left + "b1",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b1",
		block: {
			type: "start"
		}
	}, {
		leftDelimiter: _left + "\\s*\\/b1(?=(" + _right + ")|\\s)",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "close",
		block: {
			type: "end",
			cooper: "b1"
		}
	}, {
		leftDelimiter: _left + "b2",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b2",
		block: {
			type: "start"
		}
	}, {
		leftDelimiter: _left + "b2",
		wordReg: ".*?",
		rightDelimiter: _right,
		type: "b2",
		block: {
			type: "end"
		}
	}]);

	var source = fs.readFileSync(path.join(__dirname, "./testTmpl/test4.tmpl"), "utf-8");
	try {
		tokenSpliter.buildTokenTree(source);
	} catch (e) {
		assert.equal(/^End tag is not matching for token .*$/.test(e.message), true);
		done();
		return;
	}
	done("no exception happened!");
});