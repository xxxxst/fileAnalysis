
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerClick extends EMHandlerBase {
	type: EMType = "click";

	isDown = false;
	scaleGap = 0;

	createHandler() {
		return new EMHandlerClick();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousedown", this.onmousedown);
			this.comListen(this.element, "mouseup", this.onmouseup);
			this.comListen(window, "mouseup", this.onmouseupGlobal);
		} else {
			this.comListen(this.element, "touchstart", this.ontouchstart);
			this.comListen(this.element, "touchend", this.ontouchend);
			this.comListen(window, "touchend", this.ontouchendGlobal);
		}
	}

	off(_element: any, _cb: Function) {
		this.comClear();
	}

	private onmousedown(evt) {
		this.isDown = true;
	}

	private onmouseup(evt) {
		if (!this.isDown) {
			return;
		}
		this.isDown = false;
		this.cb && this.cb.call(this.target, evt);
	}

	private onmouseupGlobal(evt) {
		this.isDown = false;
	}

	private ontouchstart(evt) {
		this.isDown = true;
	}

	private static checkIsOver(el, nowEl) {
		var tmp = nowEl;
		do {
			if (tmp == el) {
				return true;
			}
			tmp = tmp.parentElement;
		} while (tmp != null);

		return false;
	}

	private ontouchend(evt) {
		if (!this.isDown) {
			return;
		}

		this.isDown = false;
		try {
			var endTarget = document.elementFromPoint(
				evt.changedTouches[0].pageX,
				evt.changedTouches[0].pageY
			);
			if (!EMHandlerClick.checkIsOver(this.element, endTarget)) {
				return;
			}
		} catch (ex) { }

		var newEvent = this.dealTouchEvt(evt);
		this.cb && this.cb.call(this.target, newEvent);
	}

	private ontouchendGlobal(evt) {
		this.isDown = false;
	}

}