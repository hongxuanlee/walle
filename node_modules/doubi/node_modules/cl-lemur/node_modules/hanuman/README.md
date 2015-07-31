hanuman
=================================== 
Hanuman is token spliter which can build a token tree or a token array.<br>
Hanuman is simple and flexible.

What can hanuman do?
-----------------------------------
There is a text.
```
hello world!
<#b1#> 
    Ok, this is block one.
	<#b2#>
		This is block2
	<#/b2#>
<#/b1#>
```
<#b1#> and <#/b1#> are a pair of tags. <#b2#> and <#/b2#> are a pair of tags. Obviously, when we analysis that text, we expect a structured object like this:
```
|-{root}
|  |-(hello world!)
|  |-{b1}
|  |  |-(Ok, this is block one.)
|  |  |-{b2}
|  |  |  |-(This is block2)
```
Here, we imitate directory structure to express tree. It means root has two chidlren, "hello world" and b1. B1 has two children, "Ok, this is block one." and b2. B2 has one child "This is block2".

This is hanuman's main job, to make text structured.

install and require
-------------------------------------------------------------------
```
npm install hanuman
```
```
var TokenSpliter = require("hanuman");
```
An example
---------------------------------------------------------------------
Text like this: 
```
hello world!
<#b1#> 
    Ok, this is block one.
    <#b2#>
        This is block2
    <#/b2#>
<#/b1#>
<#include name="ok!"#>
```
Define a token spliter and build a token tree.
```
var TokenSpliter = require("hanuman");
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
	type: "b1",
	block: {
		type: "end",
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
	leftDelimiter: _left + "\\s*\\/b2(?=(" + _right + ")|\\s)",
	wordReg: ".*?",
	rightDelimiter: _right,
	type: "b2",
	block: {
		type: "end"
	}
}, {
	leftDelimiter: _left + "\\s*include(?=(" + _right + ")|\\s)",
	wordReg: ".*?",
	rightDelimiter: _right,
	type: "include"
}]);


var tokenTree = tokenSpliter.buildTokenTree(source);
console.log(tokenTree);
```
Result is a root of a tree.

How to use hanuman
--------------------------------------------------------
On the whole, example code contains two parts:
### Create a tokenSpliter

TokenSpliter instance is a text handling tool which is responsible for building a token tree. When we create a tokenSpliter, we are describe the ability of tokenSpliter, it includes these aspect:
* should recognition which tokens.
* the strcture of a token
* it's an inline token or a block token. A block token needs end-tag, an inline token does not.<br>
Let's see what do we need when we create a tokenSpliter. A list which contains a group of object.
These object looks like:
```
{
	leftDelimiter: _left + "b1",
	wordReg: ".*?",
	rightDelimiter: _right,
	type: "b1",
	block: {
		type: "start"
	}
}
```
* leftDelimiter<br>
  Left delimiter regExp. Delimiter is the boundary of a word. It could used to warn us there is a token. But it won't be included in the token' word. It's just a boundary. Left delimiter is used to warn us that you reached a token.
* wordReg<br>
  Token's word's regExp.
* rightDelimiter<br>
  Right delimiter regExp.
  LeftDelimiter wordReg and rightDelimiter determine which strings in a text will be recognized. In fact, "leftDelimiter + wordReg + rightDelimiter" is the token regExp.
* type<br>
  Define a type for your token.
* block<br>
  Block config. You can set type for block. If type is "start", means this token is the start of a block. If type is "end" means this token is the end of a block. In the example, <#b1#> is the start of a block, <#/b1#> is the end of a block.

#### Build token tree
This step is very easy, you just need to call buildTokenTree function.
```
var tokenTree = tokenSpliter.buildTokenTree(source);
```
TokenTree is a tree structure. For every node, it has two parts:
* token<br>
  Token saves token object.
* children<br>
  Children are son nodes of this node.





