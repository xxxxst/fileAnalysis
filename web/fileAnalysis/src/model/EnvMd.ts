
export default class EnvMd {
	static isMobile = false;
	static isScreenVer = true;
	static ieVersion = -1;

	static init() {
		this.isMobile = !EnvMd.isPC();
		this.ieVersion = EnvMd.getIEVersion();

		window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", ()=>this.checkIsScreenVer(), false);
	}

	static isPC() {
		const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;

		// console.info(!navigator.userAgent.match(reg));
		return !navigator.userAgent.match(reg);
		// if ((navigator.userAgent.match(reg))) {
		// 	return false;
		// } else {
		// 	return true
		// }
	}

	static checkIsScreenVer() {
		if (window.orientation == 180 || window.orientation == 0) {
			//竖屏状态
			EnvMd.isScreenVer = true;
		}
		if (window.orientation == 90 || window.orientation == -90) {
			//横屏状态
			EnvMd.isScreenVer = false;
		}
	}

	static getIEVersion() {
		//取得浏览器的userAgent字符串
		var userAgent = navigator.userAgent;
		//判断是否IE<11浏览器
		var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
	
		//edge
		var isEdge = userAgent.indexOf("Edge") > -1 && !isIE;
		if(isEdge) return 11.5;
	
		// ie11
		var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1 && !isIE;
		if(isIE11) return 11;
	
		// not ie
		if(!isIE) return -1;
	
		// old version
		/MSIE (\d+\.\d+);/.test(userAgent);
		var fIEVersion = parseFloat(RegExp["$1"]);
		switch(fIEVersion) {
			case 7: case 8: case 9: case 10: {
				return fIEVersion;
			}
			default: return 6;
		}
	}

}
