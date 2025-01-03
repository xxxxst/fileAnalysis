
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

// ini 文件解析
export default class IniFileCtl {

	static parse(strData: string) {
		var mapRst: Record<string, string> = {};

		//success
		var arrData = strData.split("\r\n");
		for (var i = 0; i < arrData.length; ++i) {
			var idx = arrData[i].indexOf("=");
			// var arrOne = arrData[i].split("=");
			if (idx < 0) {
				continue;
			}
			var key = arrData[i].substr(0, idx).trim().replace(/^"(.*?)"$/, "$1");
			var val = arrData[i].substr(idx + 1).trim().replace(/^"(.*?)"$/, "$1");

			mapRst[key] = val;
		}

		return mapRst;
	}
}