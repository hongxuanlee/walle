var path = require("path");
var builder = require("front-module-builder");

builder.build({
	mainJsPath: path.join(__dirname, "../../lib/cacheLoader/cacheLoader.js"),
	targetJsPath: path.join(__dirname, "./lib/cacheLoader.js"),
	exportsCode: "var CacheLoader = "
});