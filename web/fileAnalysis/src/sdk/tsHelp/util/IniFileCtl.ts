
// ini 文件解析
export default class IniFileCtl {

	static parse(strData:string) {
		var mapRst = {};

		//success
		var arrData = strData.split("\r\n");
		var reg = /^\s*([^=]*?)\s*=\s*(.*)\s*$/;
		for (var i = 0; i < arrData.length; ++i) {
			var tmp = reg.exec(arrData[i]);
			if(!tmp || tmp[1] == "") {
				continue;
			}
			var key = tmp[1];
			var val = tmp[2].replace(/^["'](.*?)["']$/, "$1").trim();

			mapRst[key] = val;
		}

		return mapRst;
	}
}