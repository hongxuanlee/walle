var path = require("path");
var builder = require("front-module-builder");

builder.build({
	mainJsPath: path.join(__dirname, "../index.js"),
	targetJsPath: path.join(__dirname, "../browser/walle.js"),
	exportsCode: "var walle = "
});