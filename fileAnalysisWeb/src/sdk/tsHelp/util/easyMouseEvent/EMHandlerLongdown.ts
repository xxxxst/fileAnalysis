
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerLongdown extends EMHandlerBase {
	static longDownWaitTime = 400;

	type: EMType = "longdown";

	timerId: any = -1;
	isUp = false;
	downPos = { x: 0, y: 0 };
	movePos = { x: 0, y: 0 };

	createHandler() {
		return new EMHandlerLongdown();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousedown", this.onmousedown);
			this.comListen(window, "mousemove", this.onmousemove);
			this.comListen(window, "mouseup", this.onmouseup);
		} else {
			this.comListen(this.element, "touchstart", this.ontouchstart);
			this.comListen(window, "touchmove", this.ontouchmove);
			this.comListen(window, "touchend", this.ontouchend);
		}
	}

	off(_element: any, _cb: Function) {
		this.comClear();
	}

	onmousedown(evt: MouseEvent) {
		this.isUp = false;
		this.downPos = { x: evt.pageX, y: evt.pageY };
		this.movePos = { x: evt.pageX, y: evt.pageY };

		this.timerId = setTimeout(() => {
			this.timerId = -1;
			if (this.isUp) {
				return;
			}
			const gap = 5;
			if (Math.abs(this.movePos.x - this.downPos.x) > gap || Math.abs(this.movePos.y - this.downPos.y) > gap) {
				return;
			}
			this.cb && this.cb.call(this.target, evt);
		}, EMHandlerLongdown.longDownWaitTime);
	}

	onmousemove(evt) {
		this.movePos.x = evt.pageX;
		this.movePos.y = evt.pageY;
	}

	onmouseup(evt) {
		this.isUp = true;
		if (this.timerId >= 0) {
			clearTimeout(this.timerId);
			this.timerId = -1;
		}
	}

	ontouchstart(evt) {
		this.isUp = false;

		var touch = evt.touches && evt.touches[0];
		if (touch) {
			this.downPos = { x: touch.pageX, y: touch.pageY };
			this.movePos = { x: touch.pageX, y: touch.pageY };
		}

		this.timerId = setTimeout(() => {
			this.timerId = -1;
			if (this.isUp) {
				return;
			}
			const gap = 5;
			if (Math.abs(this.movePos.x - this.downPos.x) > gap || Math.abs(this.movePos.y - this.downPos.y) > gap) {
				return;
			}

			var newEvent = this.dealTouchEvt(evt);
			this.cb && this.cb.call(this.target, newEvent);
		}, EMHandlerLongdown.longDownWaitTime);
	}

	ontouchmove(evt) {
		var touch = evt.touches && evt.touches[0];
		if (touch) {
			this.movePos.x = touch.pageX;
			this.movePos.y = touch.pageY;
		}
	}

	ontouchend(evt) {
		this.isUp = true;
		if (this.timerId >= 0) {
			clearTimeout(this.timerId);
			this.timerId = -1;
		}
	}

}