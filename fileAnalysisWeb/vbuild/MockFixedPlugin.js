'use strict'

// const { OriginalSource } = require("webpack-sources");
function MockFixedPlugin(options){
	
}

module.exports = MockFixedPlugin;

MockFixedPlugin.prototype.apply = function(compiler) {
	compiler.plugin("compilation", function(compilation) {
		compilation.hooks.succeedModule.tap('MockFixedPlugin', (wpModule) => {
			if(!wpModule.resource || !wpModule.resource.indexOf || wpModule.resource.replace(/[\\/]+/g, "/").indexOf("mockjs/dist/mock.js")<0){
				return;
			}

			function replace(oldStr, match, newStr) {
				var idx = oldStr.indexOf(match);
				if(idx < 0) {
					return oldStr;
				}
				return oldStr.substr(0, idx) + newStr + oldStr.substr(idx + match.length);
			}

			var code = wpModule._source._value;

			var mat1 = "that.dispatchEvent(new Event(event.type";
			var str1 = `
			var evt = new Event(event.type);
			for(var key in event) {
				try {
					if(typeof(event[key]) != "function") {
						evt[key] = event[key];
					}
				} catch(ex) {}
			}
			that.dispatchEvent((evt`;
			code = replace(code, mat1, str1);

			var mat2 = "send: function send(data) {";
			var str2 = `
			send: function send(data) {
				for (var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
					try {
						this.custom.xhr[XHR_RESPONSE_PROPERTIES[i]] = this[XHR_RESPONSE_PROPERTIES[i]]
					} catch (e) {}
				}
			`;
			code = replace(code, mat2, str2);
			
			wpModule._source._value = code;
			return;
		});
	});
}