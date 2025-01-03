import MockExtendChk from '@/sdk/tsHelp/util/MockExtendChk';

export default class MainMock {
	static async init() {
		return await (new MainMock()).run();
	}

	async run() {
		if (!this.enableMock()) {
			return;
		}

		// try {
		// 	// eslint-disable-next-line
		// 	var Mock = (await import("mockjs")).default;
		// 	this.initExtend(Mock);

		// 	var $fact = function (data) {
		// 		return () => Mock.mock(data).data;
		// 	};

		// 	var u2r = function(url) {
		// 		var str = url;
		// 		str = str.replace(/\{[^}]+\}/g, "[^/]+");
		// 		str = str.replace(/\./, "\\.");
		// 		return new RegExp(str);
		// 	}

		// 	Mock.mock('/server/test', 'get', $fact({
		// 		"data|4-12": [{
		// 			"id|+1": 0,
		// 			"name": "name @increment()",
		// 		}]
		// 	}));

		// 	// window["Mock"] = Mock;
		// 	// console.info(Mock);
		// } catch (ex) { }
	}

	isDebug() {
		return (process.env.NODE_ENV !== 'production' || process.env.VUE_APP_PREVIEW === 'true');
	}

	enableMock() {
		return false;
		return this.isDebug() || window["Mock"];
	}

	initExtend(Mock) {
		MockExtendChk.register(Mock);
	}
}
