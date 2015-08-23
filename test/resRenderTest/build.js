var path = require("path");
var builder = require("front-module-builder");

builder.build({
	mainJsPath: path.join(__dirname, "../../lib/resRender/resRender.js"),
	targetJsPath: path.join(__dirname, "./lib/resRender.js"),
	exportsCode: "var resRender = "
});