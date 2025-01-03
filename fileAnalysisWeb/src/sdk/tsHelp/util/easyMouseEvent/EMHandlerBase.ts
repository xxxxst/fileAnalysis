
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';

class OriginEventMd {
	element = null;
	cb: Function = null;

	constructor(_element, _cb) {
		this.element = _element;
		this.cb = _cb;
	}
}

export default abstract class EMHandlerBase {
	static vTag = "_$_em_event";
	static globalHandlerId = 0;
	static isPc = null;

	type: EMType = "down";
	protected handlerId = 0;
	protected mapOriginEvent: Record<string, OriginEventMd[]> = {};

	element: any = null;
	target: any = null;
	cb: Function = null;

	constructor() {
		this.createId();
	}

	abstract listen(_element: any, _cb: Function, _target: any);
	abstract off(_element: any, _cb: Function);
	abstract createHandler(): EMHandlerBase;

	// getHandler(el): EMDataMd {
	// 	var map = el[EMHandlerBase.vTag];
	// 	if(!map) {
	// 		return null;
	// 	}
	// 	map = map[this.type];
	// 	if(!map) {
	// 		return null;
	// 	}
	// 	var hd = map[this.handlerId];
	// 	if(!hd) {
	// 		return null;
	// 	}
	// 	return hd;
	// }

	// protected comGetInfo(el) {
	// 	// el[EMHandlerBase.vTag][this.type][this.handlerId] = this
	// 	var map = (el[EMHandlerBase.vTag] || (el[EMHandlerBase.vTag]={}));
	// 	map = (map[this.type] || (map[this.type] = {}));
	// 	return (map[this.handlerId] || (map[this.handlerId] = this)) as EMDataMd;
	// }

	protected static isPC() {
		if (EMHandlerBase.isPc === null) {
			const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
			EMHandlerBase.isPc = !navigator.userAgent.match(reg);
		}

		return EMHandlerBase.isPc;
	}

	protected bindHandler(_element: any, _cb: Function, _target: any = null) {
		this.element = _element;
		this.target = _target;
		this.cb = _cb;

		var el = this.element;
		// el[EMHandlerBase.vTag][this.type][this.handlerId] = this;
		var map = (el[EMHandlerBase.vTag] || (el[EMHandlerBase.vTag] = {}));
		map = (map[this.type] || (map[this.type] = {}));
		map[this.handlerId] || (map[this.handlerId] = this);
	}

	protected createId() {
		++EMHandlerBase.globalHandlerId;
		this.handlerId = EMHandlerBase.globalHandlerId;
	}

	protected comListen(ele, originFunName: string, fun: Function) {
		// var md = new EMComEventMd();
		// md.funName = funName;
		// md.originFunName = originFunName;
		// md.fun = evt => fun.call(this, evt, el, cb, taget);
		// md.cb = cb;

		// var info = this.comGetInfo(el);
		// info.orginEvents.push(md);
		// el.addEventListener(originFunName, md.fun);

		var anoFun = evt => fun.call(this, evt);

		if (!(originFunName in this.mapOriginEvent)) {
			this.mapOriginEvent[originFunName] = [];
		}
		var arr = this.mapOriginEvent[originFunName];
		arr.push(new OriginEventMd(ele, anoFun));

		this.element.addEventListener(originFunName, anoFun);
	}

	protected clearEleMap() {
		var el = this.element;
		var map1 = el[EMHandlerBase.vTag];
		if (!map1) {
			return;
		}
		var map2 = map1[this.type];
		if (!map2) {
			return;
		}
		if (!map2[this.handlerId]) {
			for (var key in map1) {
				return;
			}
			delete el[EMHandlerBase.vTag];
			return;
		}
		delete map2[this.handlerId];
		for (var key in map2) {
			return;
		}
		delete map1[this.type];
		for (var key in map1) {
			return;
		}
		delete el[EMHandlerBase.vTag];
	}

	protected comClear() {
		for (var key in this.mapOriginEvent) {
			var arr = this.mapOriginEvent[key];
			for (var i = 0; i < arr.length; ++i) {
				arr[i].element.removeEventListener(key, arr[i].cb);
			}
			// this.element.removeEventListener(key, fun);
		}
		this.mapOriginEvent = {};
		this.clearEleMap();
	}

	protected dealTouchEvt(evt) {
		var touch = evt.touches && evt.touches[0];
		var newEvent: any = {
			button: 1,
			which: 1,
			originalEvent: evt,
			touches: evt.touches,
			stopPropagation: () => evt.stopPropagation()
		};
		if (evt.touches.length > 1) {
			newEvent.which = 100 + evt.touches.length;
		}
		if (touch != null) {
			var ele = document.elementFromPoint && document.elementFromPoint(touch.pageX, touch.pageY);
			newEvent.target = ele || evt.target;
			newEvent.srcElement = ele || evt.srcElement;

			newEvent.clientX = touch.clientX;
			newEvent.clientY = touch.clientY;
			newEvent.pageX = touch.pageX;
			newEvent.pageY = touch.pageY;
			newEvent.screenX = touch.screenX;
			newEvent.screenY = touch.screenY;
			newEvent.radiusX = touch.radiusX;
			newEvent.radiusY = touch.radiusY;
		}

		return newEvent;
	}
}