
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerUp extends EMHandlerBase {
	type: EMType = "up";
	static isDown = false;
	static listenCount = 0;
	static lastTouchEvt = null;

	createHandler() {
		return new EMHandlerUp();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		EMHandlerUp.initGlobalEvent();

		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mouseup", this.onmouseup);
		} else {
			this.comListen(this.element, "touchend", this.ontouchend);
		}
	}

	off(_element: any, _cb: Function) {
		EMHandlerUp.clearGlobalEvent();

		this.comClear();
	}

	private static initGlobalEvent() {
		++EMHandlerUp.listenCount;
		if (EMHandlerUp.listenCount > 1) {
			return;
		}

		if (this.isPC()) {
			return;
		}

		// this.anoTouchmove = (evt) => this.ontouchmove(evt);
		window.addEventListener("touchstart", this.anoTouchstart);
		window.addEventListener("touchmove", this.anoTouchmove);
	}

	private static clearGlobalEvent() {
		--EMHandlerUp.listenCount;
		if (EMHandlerUp.listenCount > 0) {
			return;
		}
		if (this.isPC()) {
			return;
		}
		window.removeEventListener("touchstart", this.anoTouchstart);
		window.removeEventListener("touchmove", this.anoTouchmove);
	}

	private static anoTouchstart = (evt) => EMHandlerUp.ontouchstart(evt);
	private static ontouchstart(evt) {
		EMHandlerUp.lastTouchEvt = evt;
	}

	private static anoTouchmove = (evt) => EMHandlerUp.ontouchmove(evt);
	private static ontouchmove(evt) {
		EMHandlerUp.lastTouchEvt = evt;
	}

	private onmouseup(evt) {
		this.cb && this.cb.call(this.target, evt);
	}

	private ontouchend(evt) {
		var newEvent = null;
		if (!EMHandlerUp.lastTouchEvt) {
			newEvent = this.dealTouchEvt(evt);
		} else {
			newEvent = this.dealTouchEvt(EMHandlerUp.lastTouchEvt);
		}
		// var newEvent = this.dealTouchEvt(evt);
		this.cb && this.cb.call(this.target, newEvent);
	}

}