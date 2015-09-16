var path = require("path");
var builder = require("front-module-builder");

builder.build({
	mainJsPath: path.join(__dirname, "../../lib/router/proxy.js"),
	targetJsPath: path.join(__dirname, "./lib/proxy.js"),
	exportsCode: "var proxy = "
});
