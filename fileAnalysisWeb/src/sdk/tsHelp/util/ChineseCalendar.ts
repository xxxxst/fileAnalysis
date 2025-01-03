
// 农历
// month start with 0
export class ChineseDate {
	year = 36;
	month = 0;
	day = 1;
	// hour = 0;
	// minutes = 0;
	// seconds = 0;
	// milliseconds = 0;

	isLongMonth = false;	// 大月
	isLeap = false;			// 闰月

	static strLeap = "闰";
	static strMonth = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"];
	static strDay1 = ["十", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	static strDay2 = ["初", "十", "廿", "三", "四", "五", "六", "七", "八", "九"];
	static strYear1 = [
		"甲子", "乙丑", "丙寅", "丁卯", "戊辰", "已巳", "庚午", "辛未", "壬申", "癸酉", "甲戌", "乙亥",
		"丙子", "丁丑", "戊寅", "已卯", "庚辰", "辛巳", "壬午", "癸未", "甲申", "乙酉", "丙戌", "丁亥",
		"戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未", "丙申", "丁酉", "戊戌", "已亥",
		"庚子", "辛丑", "壬寅", "癸卯", "甲辰", "乙巳", "丙午", "丁未", "戊申", "已酉", "庚戌", "辛亥",
		"壬子", "癸丑", "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "已未", "庚申", "辛酉", "壬戌", "癸亥"
	];

	constructor(_year = 36, _month = 0, _day = 1) {
		this.year = _year;
		this.month = _month;
		this.day = _day;
		// this.hour = _hour;
		// this.minutes = _minutes;
		// this.seconds = _seconds;
		// this.milliseconds = _milliseconds;
	}

	format(str: string) {
		var rst = str;

		// year
		if (rst.indexOf("yyyy") >= 0) {
			rst = rst.replace(/yyyy/g, "" + ChineseDate.strYear1[this.year % 60]);
		}

		// month
		if (rst.indexOf("MM") >= 0) {
			rst = rst.replace(/MM/g, (this.isLeap ? ChineseDate.strLeap : "") + ChineseDate.strMonth[this.month]);
		}

		// day
		if (rst.indexOf("dd") >= 0) {
			var n1 = this.day % 10;
			var n2 = Math.floor(this.day / 10);
			var str = ChineseDate.strDay2[n2] + ChineseDate.strDay1[n1];
			if (this.day == 10) {
				// 初十
				str = ChineseDate.strDay2[0] + ChineseDate.strDay1[0];
			}
			rst = rst.replace(/dd/g, str);
		}

		return rst;
	}

	static fromDateTime(year, month, day) {
		ChineseCalendar.init();
		// console.info(ChineseCalendar.data);

		var rst = new ChineseDate();

		if (year < ChineseCalendar.startTime[0]) {
			return null;
		}

		var st = ChineseCalendar.startTime;
		var et = ChineseCalendar.endTime;

		var t1 = Math.round((new Date(year, month, day).getTime() - new Date(st[0], st[1], st[2]).getTime()) / 1000 / 3600 / 24);
		var t2 = Math.round((new Date(et[0], et[1], et[2]).getTime() - new Date(year, month, day).getTime()) / 1000 / 3600 / 24);
		if (t1 < 0 || t2 < 0) {
			return null;
		}

		var idx = ChineseCalendar.findNearIdx(t1);
		var data = ChineseCalendar.data;
		if (idx < 0 || idx >= data.length) {
			return null;
		}

		rst.year = ChineseCalendar.startChineseTime[0] + idx;

		var num = data[idx][1];
		var leap = (num & 0xF) - 1;
		var leapTmp = 29 + (!!(num & 0xF0000) as any);

		var dm = t1 - data[idx][0];
		var monthDays = 0;
		var cday = 0;
		var cmonth = 0;
		var isLongMonth = false;
		for (var i = 0; i < 12; ++i) {
			var tmp = 29 + (!!(num & (1 << (11 - i + 4))) as any);
			// console.info("--", tmp, num.toString(16), (!!(num & (1 << (11 - i + 4))) as any));

			cmonth = i;
			cday = dm - monthDays + 1;
			isLongMonth = (tmp > 29);
			
			if ((monthDays + tmp) > dm) {
				break;
			}
			
			monthDays += tmp;

			if (leap == i) {
				isLongMonth = (leapTmp > 29);
				if ((monthDays + leapTmp) > dm) {
					cday = dm - monthDays + 1;
					rst.isLeap = true;
					break;
				} else {
					monthDays += leapTmp;
				}
			}
		}
		rst.month = cmonth;
		rst.day = cday;
		rst.isLongMonth = isLongMonth;
		// rst.leap = (leap == month);

		// console.info(t1, dm, monthDays);
		// console.info(rst.year, rst.month, rst.day);
		return rst;
	}

	static fromDate(date: Date) {
		var y = date.getFullYear();
		var m = date.getMonth();
		var d = date.getDate();

		return this.fromDateTime(y, m, d);
	}
}

class YearMd {
	year = 0;
	yearDays = 0;
}

export default class ChineseCalendar {
	// month start with 0
	static startTime = [1900, 0, 31];
	static endTime = [1900, 11, 31];
	static startChineseTime = [36, 0, 1];

	static isInit = false;

	static data = [];

	static init() {
		if (this.isInit) {
			return;
		}

		var arr = this.strTables.replace(/[\r\n]/g, "").split(",");

		var yearDays = 0;
		for (var i = 0; i < arr.length; ++i) {
			if (!arr[i]) {
				continue;
			}
			var num = parseInt(arr[i], 16);
			this.data.push([yearDays, num]);

			var tmp = this.getYearDays(num);
			yearDays += tmp;
		}

		this.endTime[0] = this.startTime[0] + this.data.length - 1;
		this.strTables = "";
	}

	static findNearIdx(yearDays) {
		var i = 0;
		var j = this.data.length - 1;
		var c = Math.floor((i + j) / 2);

		while (true) {
			var it = this.data[c];
			var nc = c;
			if (it[0] > yearDays) {
				j = c;
			} else {
				i = c;
			}

			nc = Math.floor((i + j) / 2);
			if (nc == c) {
				return nc;
			}

			c = nc;
		}
	}

	static getChinesetTime() {

	}

	static getYearDays(num) {
		var rst = 0;
		if (num & 0xF) {
			rst += 29 + (!!(num & 0xF0000) as any);
		}

		var count = 0;
		// var tmp = (num & 0xF000F);
		for (var i = 0; i < 12; ++i) {
			count += (!!(num & (1 << (11 - i + 4))) as any);
		}
		rst += 30 * count + 29 * (12 - count);
		return rst;
	}

	// 
	// 0x04bd8
	// 0000:0100:1011:1101:1000
	// | || |            | |--|	- 闰月月份
	// | || |------------|		- 是否为大月，每月一位
	// | ||						- 闰月是否为大月
	static strTables = `04bd8,04ae0,0a570,054d5,0d260,0d950,16554,056a0,09ad0,055d2,
04ae0,0a5b6,0a4d0,0d250,1d255,0b540,0d6a0,0ada2,095b0,14977,
04970,0a4b0,0b4b5,06a50,06d40,1ab54,02b60,09570,052f2,04970,
06566,0d4a0,0ea50,16a95,05ad0,02b60,186e3,092e0,1c8d7,0c950,
0d4a0,1d8a6,0b550,056a0,1a5b4,025d0,092d0,0d2b2,0a950,0b557,
06ca0,0b550,15355,04da0,0a5b0,14573,052b0,0a9a8,0e950,06aa0,
0aea6,0ab50,04b60,0aae4,0a570,05260,0f263,0d950,05b57,056a0,
096d0,04dd5,04ad0,0a4d0,0d4d4,0d250,0d558,0b540,0b6a0,195a6,
095b0,049b0,0a974,0a4b0,0b27a,06a50,06d40,0af46,0ab60,09570,
04af5,04970,064b0,074a3,0ea50,06b58,05ac0,0ab60,096d5,092e0,
0c960,0d954,0d4a0,0da50,07552,056a0,0abb7,025d0,092d0,0cab5,
0a950,0b4a0,0baa4,0ad50,055d9,04ba0,0a5b0,15176,052b0,0a930,
07954,06aa0,0ad50,05b52,04b60,0a6e6,0a4e0,0d260,0ea65,0d530,
05aa0,076a3,096d0,04afb,04ad0,0a4d0,1d0b6,0d250,0d520,0dd45,
0b5a0,056d0,055b2,049b0,0a577,0a4b0,0aa50,1b255,06d20,0ada0,
14b63,09370,049f8,04970,064b0,168a6,0ea50,06aa0,1a6c4,0aae0,
092e0,0d2e3,0c960,0d557,0d4a0,0da50,05d55,056a0,0a6d0,055d4,
052d0,0a9b8,0a950,0b4a0,0b6a6,0ad50,055a0,0aba4,0a5b0,052b0,
0b273,06930,07337,06aa0,0ad50,14b55,04b60,0a570,054e4,0d160,
0e968,0d520,0daa0,16aa6,056d0,04ae0,0a9d4,0a2d0,0d150,0f252,
0d520,0db27,0b5a0,055d0,04db5,049b0,0a4b0,0d4b4,0aa50,0b559,
06d20,0ad60,05766,09370,04970,06974,054b0,06a50,07a53,06aa0,
1aaa7,0aad0,052e0,0cae5,0a960,0d4a0,1e4a4,0d950,05abb,056a0,
0a6d0,151d6,052d0,0a8d0,1d155,0b2a0,0b550,06d52,055a0,1a5a7,
0a5b0,052b0,0a975,068b0,07290,0baa4,06b50,02dbb,04b60,0a570,
052e6,0d160,0e8b0,06d25,0da90,05b50,036d3,02ae0,0a3d7,0a2d0,
0d150,0d556,0b520,0d690,155a4,055b0,02afa,045b0,0a2b0,0aab6,
0a950,0b4a0,1b2a5,0ad50,055b0,02b73,04570,06377,052b0,06950,
06d56,05aa0,0ab50,056d4,04ae0,0a570,06562,0d2a0,0eaa6,0d550,
05aa0,0aea5,0a6d0,04ae0,0aab3,0a4d0,0d2b7,0b290,0b550,15556,
02da0,095d0,145b4,049b0,0a4f9,064b0,06a90,0b696,06b50,02b60,
09b64,09370,04970,06963,0e4a0,0eaa7,0da90,05b50,02ed5,02ae0,
092e0,1c2d4,0c950,0d4d9,0b4a0,0b690,057a7,055b0,025d0,095b5,
092b0,0a950,1c953,0b4a0,0b5a8,0ad50,055b0,12375,02570,052b0,
1a2b4,06950,06cbb,05aa0,0ab50,14ad6,04ae0,0a570,054d5,0d260,
0e950,07553,05aa0,0aba7,095d0,04ae0,0a5b6,0a4d0,0d250,0da55,
0b540,0d6a0,0ada1,095b0,04b77,049b0,0a4b0,0b4b5,06a50,0ad40,
1ab53,02b60,19568,09370,04970,06566,0e4a0,0ea50,16a94,05ad0,
02b60,0aae2,092e0,0cad6,0c950,0d4a0,0dca5,0b650,056a0,0b5b3,
025d0,093b7,092b0,0a950,0b556,074a0,0b550,05d54,04da0,0a5b0,
06572,052b0,0aaa6,0e950,06aa0,1aaa5,0ab50,04b60,0aae3,0a570,
052d7,0d260,0d950,16956,056a0,09ad0,145d4,04ad0,0a4fa,0a4d0,
0d250,1d457,0b540,0b6a0,195a5,095b0,049b0,0a973,0a4b0,0b2b8,
06a50,06d40,0b746,0ab60,09570,142f4,04970,064b0,074a3,0ea50,
16c57,05ac0,0ab60,096d5,092e0,0c960,0d954,0d4a0,0daa8,0b550,
056a0,1a9b6,025d0,092d0,0cab5,0a950,0b4a0,0f4a1,0b550,15557,
04ba0,0a5b0,05575,052b0,0a930,07954,06aa0,0ada8,0ab50,04b60,
0a6e6,0a570,05260,0ea65,0d920,0daa0,156a2,096d0,04bd7,04ad0,
0a4d0,0d4b5,0d250,0d520,1d544,0b5a0,056ea,095b0,049b0,0a576,
0a4b0,0b250,0ba54,06d20,0ada0,06b62,09370,04af6,04970,064b0,
06ca5,0ea50,06b20,0bac3,0ab60,093d8,092e0,0c960,0d556,0d4a0,
0da50,05d55,056a0,0aad0,065d2,052d0,1a8b7,0a950,0b4a0,1b2a5,
0ad50,055a0,0aba3,0a5b0,15278,05270,06930,07536,06aa0,0ad50,
14b54,04b60,0a570,144e3,0d260,1e867,0d520,0da90,06ea5,056d0,
04ae0,0a9d4,0a4d0,0d2b8,0d250,0d520,0db27,0b5a0,056d0,04db5,
049b0,0a4b0,1c4b3,0aa50,0b558,06d20,0ad60,15365,05370,04970,
06974,064b0,06aa8,0ea50,06aa0,1aaa6,0aad0,052e0,0cae5,0c960,
0d4a0,0f4a3,0d950,05b57,056a0,0a6d0,055d5,052d0,0a950,0d954,
0b4a0,0b56a,0ad50,055a0,0a7a6,0a5b0,052b0,0a975,06930,07290,
1aa93,06d50,12d57,04b60,0a570,052e5,0d160,0e8b0,16524,0da90,
06b6a,056d0,02ae0,0a5d6,0a2d0,0d150,1d155,0b520,0da90,075a2,
055b0,02bb7,045b0,0a2b0,0b2b5,0a950,0b520,0bd24,0ad50,055b0,
05371,04570,16176,052b0,06950,16955,05aa0,0ab50,14ad3,04ae0,
1a4e7,0a560,0d4a0,0eaa6,0d950,05aa0,1a6a4,0a6d0,04ae0,0cab1,
0a8d0,0d4b7,0b290,0b550,15555,035a0,095d0,055b3,049b0,0a977,
068b0,06a90,0b696,06b50,02da0,09b64,09570,051e8,0d160,0e4a0,
0eaa7,0da90,05b50,02ed5,02ae0,092e0,0d2d4,0c950,0d557,0b4a0,
0b690,15996,055b0,029d0,095b4,0a2b0,1a939,0a950,0b4a0,0b6a6,
0ad50,055a0,0ab74,02570,052b0,0b2b3,06950,06d57,05aa0,0ab50,
056d5,04ae0,0a570,05554,0d260,0e96a,0d550,05aa0,1aaa7,096d0,
04ae0,1a1b5,0a4d0,0d250,1d253,0b540,1d658,02da0,095b0,14976,
049b0,0a4b0,0b4b4,06a50,0b55b,06b50,02b60,09766,09370,04970,
16165,0e4a0,0ea50,07a93,05ac0,0abd8,02ae0,092e0,0cad6,0c950,
0d4a0,0dca5,0b650,056a0,0d5b1,025d0,093b7,092b0,0a950,1d155,
074a0,0b550,14d53,055a0,1a568,0a570,052b0,0aaa6,0e950,06ca0,
1aaa4,0ab50,04b60,18ae2,0a570,052d7,0d260,0e920,0ed55,05aa0,
09ad0,056d3,04ad0,0a5b7,0a4d0,0d250,0da56,0b540,0d6a0,09da4,
095b0,04ab0,0a973,0a4b0,0b2b7,06a50,06d40,1b345,0ab60,095b0,
05373,04970,06567,0d4a0,0ea50,06e56,05ac0,0ab60,096d4,092e0,
0c960,0e953,0d4a0,0daa7,0b550,056a0,0ada5,0a5d0,092d0,0d2b3,
0a950,1b458,074a0,0b550,15556,04da0,0a5b0,05574,052b0,0a930,
16933,06aa0,1aca7,0ab50,04b60,1a2e5,0a560,0d260,1e264,0d920,
0dac9,0d6a0,09ad0,149d6,04ad0,0a4d0,0d4b5,0d250,0d53b,0b540,
0b6a0,057a7,095b0,049b0,1a175,0a4b0,0b250,0ba54,06d20,0adc9,
0ab60,09570,04af6,04970,064b0,06ca5,0ea50,06d20,19aa2,0ab50,
152d7,092e0,0c960,0d556,0d4a0,0da50,15554,056a0,1aaa8,0a5d0,
052d0,0aab6,0a950,0b4a0,1b4a5,0b550,055a0,0aba3,0a5b0,05377,
05270,06930,07536,06aa0,0ad50,05b53,04b60,0a5e8,0a4e0,0d260,
0ea66,0d520,0da90,06ea5,056d0,04ae0,0aad3,0a4d0,0d2b7,0d250,
0d520,1d926,0b6a0,056d0,055b3,049b0,1a478,0a4b0,0aa50,0b656,
06d20,0ad60,05b64,05370,04970,06973,064b0,06aa7,0ea50,06b20,
0aea6,0ab50,05360,1c2e4,0c960,0d4d9,0d4a0,0da50,05b57,056a0,
0a6d0,055d5,052d0,0a950,1c953,0b490,0b5a8,0ad50,055a0,1a3a5,
0a5b0,052b0,1a174,06930,072b9,06a90,06d50,02f56,04b60,0a570,
054e5,0d160,0e920,0f523,0da90,06ba8,056d0,02ae0,0a5d6,0a4d0,
0d150,0d955,0d520,0daa9,0b590,056b0,02bb7,049b0,0a2b0,0b2b5,
0aa50,0b520,1ad23,0ad50,15567,05370,04970,06576,054b0,06a50,
07954,06aa0,0ab6a,0aad0,05360,0a6e6,0a960,0d4a0,0eca5,0d950,
05aa0,0b6a3,0a6d0,04bd7,04ab0,0a8d0,0d4b6,0b290,0b540,0dd54,
055a0,095ea,095b0,052b0,0a976,068b0,07290,1b295,06d50,02da0`;
}