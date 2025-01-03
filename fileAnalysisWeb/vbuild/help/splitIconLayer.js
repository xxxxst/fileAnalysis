/*
 * split layer in ./resource/origin/output/icon.svg
 */
var parser = require('fast-xml-parser');
var Parser = parser.j2xParser;
const fs = require('fs');

function isAttr(name) {
	return (name.substr(0, 2) == "$_");
}

function isArray(obj) {
	return (obj instanceof Array);
}

function eachArr(arr, cb) {
	if (isArray(arr)) {
		for (var i = 0; i < arr.length; ++i) {
			cb(arr[i]);
		}
	} else {
		cb(arr);
	}
}

var xmlOptions = {
	attributeNamePrefix : "$_",
	// attrNodeName: "attr", //default is 'false'
	// textNodeName : "#text",
	ignoreAttributes : false,
	// ignoreNameSpace : false,
	// allowBooleanAttributes : false,
	// parseNodeValue : true,
	// parseAttributeValue : true,
	// trimValues: true,
	// cdataTagName: "__cdata", //default is 'false'
	// cdataPositionChar: "\\c",
	// parseTrueNumberOnly: false,
	// arrayMode: false, //"strict"
	// attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
	// tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
	// stopNodes: ["parse-me-as-string"]
};

function getLayerName() {
	const srcPath = './resource/origin/icon.svg';
	var data = fs.readFileSync(srcPath).toString();
	var jsonObj = parser.parse(data, xmlOptions);
	
	var arr = jsonObj.svg.g;

	var rst = [];
	for(var i = 0; i < arr.length; ++i) {
		rst.push(arr[i]["$_inkscape:label"]);
	}

	return rst;
}

function cloneSvgRoot(jsonObj) {
	var rst = { svg: {} };
	for(var key in jsonObj) {
		if(key != "svg") {
			rst[key] = jsonObj[key];
		}
	}

	for(var key in jsonObj.svg) {
		if (key == "g") {
			continue;
		}
		rst.svg[key] = jsonObj.svg[key];
	}
	// rst.svg.g = [];
	return rst;
}

(function() {
	const srcPath = './resource/origin/output/icon.svg';
	// const outDir = './resource/origin/output/';
	const outDir = './src/assets/img/';

	var data = fs.readFileSync(srcPath).toString();

	// get layer name from origin file, in './resource/origin/icon.svg'
	var arrLayerName = getLayerName();

	var jsonObj = parser.parse(data, xmlOptions);
	var arr = jsonObj.svg.g;
	if (!isArray(arr)) {
		console.error("failed, layer no found");
		return;
	}
	if (arr.length != arrLayerName.length) {
		console.error("failed, layer count not same");
		return;
	}
	for (var i = arr.length - 1; i >= 0; --i) {
		// ignore hide layer
		// if (arr[i].$_display == "none") {
		// 	arr.splice(i, 1);
		// 	arrLayerName.splice(i, 1);
		// 	continue;
		// }

		// keep attr in <path/>
		var mapReserveKey = {
			"$_fill": null,
			"$_d": null,
			"$_d": null,
		};

		// ignore attr in <g/>
		var mapIgnoreGKey = {
			"$_shape-rendering": null,
			"$_display": null,
		};

		for (var key in arr[i]) {
			if (isAttr(key)) {
				continue;
			}
			var child = arr[i][key];
			// child is Object or Array
			eachArr(child, (it) => {
				var arrDelKey = [];
				// remove path attr
				for (var key2 in it) {
					if (!isAttr(key2)) {
						continue;
					}
					if (!(key2 in mapReserveKey)) {
						arrDelKey.push(key2);
					}
				}
				for (var j = 0; j < arrDelKey.length; ++j) {
					delete it[arrDelKey[j]];
				}
				// copy g style to path
				for(var keyGAttr in arr[i]) {
					if (!isAttr(keyGAttr)) {
						continue;
					}
					if(keyGAttr in mapIgnoreGKey) {
						continue;
					}
					it[keyGAttr] = arr[i][keyGAttr];
				}
			});
		}
	}
	var ps = new Parser(xmlOptions);

	for(var i = 0; i < arr.length; ++i) {
		var name = arrLayerName[i];
		if (name == "icon") {
			continue;
		}
		// ignore if layer name start with "_"
		if (name.substr(0, 1) == "_") {
			continue;
		}

		var root = cloneSvgRoot(jsonObj);
		for(var key in arr[i]) {
			if (isAttr(key)) {
				continue;
			}
			root.svg[key] = arr[i][key];
		}
		
		var xml = ps.parse(root);

		// convert camelCase name to hyphen-case
		name = name.replace(/([A-Z]+)/g, "-$1").replace(/^[-]+/g,"").toLowerCase();

		var outPath = outDir + name + ".svg";
		fs.writeFileSync(outPath, xml);
		
	}

	return;
})();