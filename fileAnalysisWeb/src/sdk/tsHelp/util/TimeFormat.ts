
export default class TimeFormat {
	static weekFormat: any = {
		1: "Monday",
		2: "Tuesday",
		3: "Wednesday",
		4: "Thursday",
		5: "Friday",
		6: "Saturday",
		7: "Sunday"
	};

	static format(date: any = null, pattern = "") {
		if (date == undefined || date == null) {
			date = new Date();
		}
		if (pattern == undefined) {
			pattern = "yyyy-MM-dd hh:mm:ss";
		}

		var o = {
			"M+": date.getMonth() + 1,
			"d+": date.getDate(),
			"h+": date.getHours(),
			"m+": date.getMinutes(),
			"s+": date.getSeconds(),
			"q+": Math.floor((date.getMonth() + 3) / 3),
			"w+": TimeFormat.weekFormat[date.getDay()],
			"S": date.getMilliseconds()
		};
		if (/(y+)/.test(pattern)) {
			pattern = pattern.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}

		for (var k in o) {
			if (new RegExp("(" + k + ")").test(pattern)) {
				pattern = pattern.replace(RegExp.$1, (RegExp.$1.length == 1 || k == "w+") ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}

		return pattern;
	}
}