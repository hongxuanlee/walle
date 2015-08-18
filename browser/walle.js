var walle = (function(){var __moduleMap={};var define = function(path,func){__moduleMap[path] = {func:func};};var require = function(path){if(!__moduleMap[path])throw new Error('can not find module:'+path);if(__moduleMap[path].module)return __moduleMap[path].module.exports;var module={exports:{}};__moduleMap[path].func.apply(module, [require,module,module.exports]);__moduleMap[path].module = module;return __moduleMap[path].module.exports;};define('/Users/ddchen/Coding/opensource/walle/lib/walle.js', function(require, module, exports){

});define('/Users/ddchen/Coding/opensource/walle/index.js', function(require, module, exports){
module.exports = require('/Users/ddchen/Coding/opensource/walle/lib/walle.js');
});return require('/Users/ddchen/Coding/opensource/walle/index.js')})();