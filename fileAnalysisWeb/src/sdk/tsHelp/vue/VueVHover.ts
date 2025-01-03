
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { directive, App } from './v2c/IVue';

export default class VueVHover {
	static pluginInjectKey = "_$_vhover_";

	private static hoverName = "hover";
	private static cacheIsPc = null;
	// private static bindMouseupCount = 0;
	private static bindTouchCount = 0;
	private static lastTouchedEle = [];

	static install(vueApp: App<Element>, options) {
		function updateData(el, data, tag) {
			if (!data.value) {
				return;
			}
			el[VueVHover.pluginInjectKey] = el[VueVHover.pluginInjectKey] || {};
			el[VueVHover.pluginInjectKey].tag = data.instance || tag.context;
			el[VueVHover.pluginInjectKey].value = data.value;
		}

		directive(vueApp, 'vhover', {
			mounted: function (el, data: any, tag: any) {
				updateData(el, data, tag);
				if (VueVHover.isPC()) {
					// VueVHover.bindMouseup();
					el.addEventListener("mouseover", VueVHover.onOver);
					el.addEventListener("mouseout", VueVHover.onOut);
				} else {
					VueVHover.bindToucnend();
					el.addEventListener("touchstart", VueVHover.onTouchstart);
				}
			},
			updated: function (el, data: any, tag: any) {
				updateData(el, data, tag);
			},
			unmounted: function (el, data: any, tag: any) {
				if (VueVHover.isPC()) {
					// VueVHover.unbindMouseup();
					el.removeEventListener("mouseover", VueVHover.onOver);
					el.removeEventListener("mouseout", VueVHover.onOut);
				} else {
					VueVHover.unbindToucnend();
					el.removeEventListener("touchstart", VueVHover.onTouchstart);
				}
				delete el[VueVHover.pluginInjectKey];
			}
		});
	}

	private static getRegClass(name) {
		return new RegExp("(\\s|^)" + name + "(\\s|$)", "g");
	}

	private static hasClass(ele, name: string) {
		return VueVHover.getRegClass(name).test(ele.className);
	}

	private static addClass(ele, name: string) {
		if (ele.className == "" || name == "") {
			ele.className += name;
		} else {
			ele.className += " " + name;
		}
	}

	private static removeClass(ele, name: string) {
		ele.className = ele.className.replace(VueVHover.getRegClass(name), "");
	}

	private static sendOver(el) {
		if (!el || !el[VueVHover.pluginInjectKey]) {
			return;
		}

		var val = el[VueVHover.pluginInjectKey].value;
		if (typeof (val) == "function") {
			val.call(el[VueVHover.pluginInjectKey].tag, true);
		} else if (typeof (val) == "string" && (val in el[VueVHover.pluginInjectKey].tag)) {
			el[VueVHover.pluginInjectKey].tag[val] = true;
		}
	}

	private static sendOut(el) {
		if (!el || !el[VueVHover.pluginInjectKey]) {
			return;
		}

		var val = el[VueVHover.pluginInjectKey].value;
		if (typeof (val) == "function") {
			val.call(el[VueVHover.pluginInjectKey].tag, false);
		} else if (typeof (val) == "string" && (val in el[VueVHover.pluginInjectKey].tag)) {
			el[VueVHover.pluginInjectKey].tag[val] = false;
		}
	}

	private static onOver(this: any, evt) {
		if (!VueVHover.hasClass(this, VueVHover.hoverName)) {
			VueVHover.addClass(this, VueVHover.hoverName);
		}
		VueVHover.sendOver(this);
	}

	private static onOut(this: any, evt) {
		if (VueVHover.hasClass(this, VueVHover.hoverName)) {
			VueVHover.removeClass(this, VueVHover.hoverName);
		}
		VueVHover.sendOut(this);
	}

	// private static bindMouseup() {
	// 	++this.bindMouseupCount;
	// 	if (this.bindMouseupCount > 1) {
	// 		return;
	// 	}

	// 	window.addEventListener("touchend", VueVHover.onTouchend);
	// }

	// private static unbindMouseup() {
	// 	this.bindMouseupCount = Math.max(0, --this.bindMouseupCount);

	// 	if (this.bindMouseupCount > 0) {
	// 		return;
	// 	}

	// 	window.removeEventListener("touchend", VueVHover.onTouchend);
	// }

	private static bindToucnend() {
		++this.bindTouchCount;
		if (this.bindTouchCount > 1) {
			return;
		}

		window.addEventListener("touchend", VueVHover.onTouchend);
	}

	private static unbindToucnend() {
		this.bindTouchCount = Math.max(0, --this.bindTouchCount);

		if (this.bindTouchCount > 0) {
			return;
		}

		window.removeEventListener("touchend", VueVHover.onTouchend);
	}

	private static onTouchstart(this: any) {
		// if (VueVHover.lastTouchedEle.length > 0) {
		// 	for (var i = 0; i < VueVHover.lastTouchedEle.length; ++i) {
		// 		VueVHover.removeClass(VueVHover.lastTouchedEle[i], VueVHover.hoverName);
		// 		VueVHover.sendOut(VueVHover.lastTouchedEle[i]);
		// 	}
		// 	VueVHover.lastTouchedEle = [];
		// }
		VueVHover.lastTouchedEle.push(this);
		VueVHover.addClass(this, VueVHover.hoverName);
		VueVHover.sendOver(this);
	}

	private static onTouchend(this: any) {
		if (VueVHover.lastTouchedEle.length <= 0) {
			return;
		}
		for (var i = 0; i < VueVHover.lastTouchedEle.length; ++i) {
			VueVHover.removeClass(VueVHover.lastTouchedEle[i], VueVHover.hoverName);
			VueVHover.sendOut(VueVHover.lastTouchedEle[i]);
		}
		VueVHover.lastTouchedEle = [];
	}

	private static isPC() {
		if (VueVHover.cacheIsPc !== null) {
			return VueVHover.cacheIsPc;
		}

		const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;

		VueVHover.cacheIsPc = !navigator.userAgent.match(reg);
		return VueVHover.cacheIsPc;
		// if ((navigator.userAgent.match(reg))) {
		// 	return false;
		// } else {
		// 	return true
		// }
	}
}
