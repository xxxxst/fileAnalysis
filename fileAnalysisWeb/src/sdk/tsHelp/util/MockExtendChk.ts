/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

/*
 * Mock插件-生成不重复的随机数组
 * 默认扩展名：
 *     chk 返回多个数据
 *     rdo 返回一个数据
 * @Param data 数据生成模板，可以是数组、正则表达式、字符串、对象
 * @Param min  最小数量
 * @Param max  最大数量
 *
 * 从给定数据中提取min到max个不重复的数据返回
 * 如果数据为字符串，则以','进行分割，返回数组格式
 * 如果数据为数组，返回数组并保持顺序一致
 * 如果数据为正则表达式，根据正则表达式生成随机数组
 * 如果数据为Object对象，返回Object对象
*/
export default class MockExtendChk {
	static register(Mock, chkName = "chk", rdoName = "rdo") {
		var extendObj: any = {};
		extendObj[chkName] = this.extendFactory(Mock, false);
		extendObj[rdoName] = this.extendFactory(Mock, true);

		Mock.Random.extend(extendObj);
	}

	// 计算 max 参数
	private static calcMaxLen(min, max, len) {
		max = max || len;
		max = Math.min(max, len);
		max = Math.max(min, max);
		return max;
	}

	private static produceByRegexp(Mock, data, min, max) {
		var map = {};
		var mapLen = 0;
		if (max <= 0) {
			max = Math.max(min, 99);
		}
		let len = Math.floor(Math.random() * (max - min + 1)) + min;
		if (len <= 0) {
			return [];
		}

		var idx = 0;
		let rst = [];
		while (true) {
			var tmp = Mock.mock(data);
			if (!(tmp in map)) {
				map[tmp] = tmp;
				rst.push(tmp);
				++mapLen;
			}
			++idx;

			if (rst.length >= len) {
				return rst;
			}

			if (idx > mapLen * 10) {
				max = Math.min(max, mapLen);
				len = Math.floor(Math.random() * (max - min + 1)) + min;
				if (len <= 0) {
					return [];
				}
				var rst2 = [];
				for (var i = 0; i < len; ++i) {
					rst2.push(rst[i]);
				}
				return rst2;
			}
		}

		return [];
	}

	private static produceByObject(Mock, data, min, max) {
		// 提取 key
		var keys = [];
		for (var key in data) {
			keys.push(key);
		}
		if (keys.length <= 0) {
			return {};
		}
		max = this.calcMaxLen(min, max, keys.length);
		let len = Math.floor(Math.random() * (max - min + 1)) + min;
		len = Math.min(len, keys.length);
		// console.info(min, max, len);

		// 随机化
		let rst = {};
		keys = Mock.Random.shuffle(keys);
		for (var i = 0; i < len; ++i) {
			rst[keys[i]] = data[keys[i]];
		}
		return rst;
	}

	private static produceByArray(Mock, data, min, max) {
		if (data.length <= 0) {
			return [];
		}

		max = this.calcMaxLen(min, max, data.length);
		let len = Math.floor(Math.random() * (max - min + 1)) + min;
		len = Math.min(len, data.length);
		// console.info(min, max, len);

		// 随机化
		var arrIdx = [];
		for (var i = 0; i < data.length; ++i) {
			arrIdx.push(i);
		}
		arrIdx = Mock.Random.shuffle(arrIdx);

		// 提取索引，排序
		var arrIdx2 = [];
		for (var i = 0; i < len; ++i) {
			arrIdx2.push(arrIdx[i]);
		}
		arrIdx2.sort();

		// 输出
		let rst = [];
		for (var i = 0; i < arrIdx2.length; ++i) {
			rst.push(data[arrIdx2[i]]);
		}

		// console.info(arr);
		return rst;
	}

	private static extendFactory(Mock, isRdo) {
		return (data, min, max) => {
			if (isRdo) {
				min = max = 1;
			}
			// console.info(data, min, max);

			// string
			if (typeof (data) == "string") {
				data = data.split(",").map(it => it.trim());
			}

			// not object
			if (typeof (data) != "object") {
				if (isRdo) {
					return null;
				}
				return [];
			}

			min = min || 0;
			min = Math.max(0, min);
			max = max || 0;

			var rst = [];
			if (Object.getPrototypeOf(data) == RegExp.prototype) {
				// Regexp
				// 返回数量是不精确的，因为会预测随机数的数量，避免死循环
				rst = this.produceByRegexp(Mock, data, min, max);
			} else if (!Array.isArray(data)) {
				// Object
				var obj = this.produceByObject(Mock, data, min, max);
				if (!isRdo) {
					return obj;
				}
				for (var key in obj) {
					rst.push(obj[key]);
					break;
				}
			} else {
				// Array
				rst = this.produceByArray(Mock, data, min, max);
			}
			if (!isRdo) {
				return rst;
			}

			// rdo
			if (rst.length <= 0) {
				return null;
			}
			return rst[0];
		};
	}
}
