
// ini 文件解析
export default class IniFileCtl {

	static parse(strData:string) {
		var mapRst = {};

		//success
		var arrData = strData.split("\r\n");
		for (var i = 0; i < arrData.length; ++i) {
			var arrOne = arrData[i].split("=");
			if (arrOne.length != 2) {
				continue;
			}
			var key = arrOne[0].trim().replace(/^"(.*?)"$/, "$1");
			var val = arrOne[1].trim().replace(/^"(.*?)"$/, "$1");

			mapRst[key] = val;
		}

		return mapRst;
	}
}