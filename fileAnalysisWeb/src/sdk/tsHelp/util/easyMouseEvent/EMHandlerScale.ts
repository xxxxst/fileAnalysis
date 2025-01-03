
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerScale extends EMHandlerBase {
	type: EMType = "scale";

	isDown = false;
	scaleGap = 0;

	createHandler() {
		return new EMHandlerScale();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousewheel", this.onmousewheel);
		} else {
			this.comListen(this.element, "touchstart", this.ontouchstart);
			this.comListen(this.element, "touchmove", this.ontouchmove);
			this.comListen(window, "touchend", this.ontouchend);
		}
	}

	off(_element: any, _cb: Function) {
		this.comClear();
	}

	private onmousewheel(evt) {
		var newEvent: any = evt;
		if (!("wheelDelta" in evt) && "detail" in evt) {
			newEvent = { which: evt.which, originalEvent: evt, stopPropagation: () => evt.stopPropagation() };
			newEvent.wheelDelta = evt.detail;

			newEvent.clientX = evt.clientX;
			newEvent.clientY = evt.clientY;
			newEvent.pageX = evt.pageX;
			newEvent.pageY = evt.pageY;
			newEvent.screenX = evt.screenX;
			newEvent.screenY = evt.screenY;
			newEvent.radiusX = evt.radiusX;
			newEvent.radiusY = evt.radiusY;
		}
		this.cb && this.cb.call(this.target, newEvent);
	}

	private ontouchstart(evt) {
		this.isDown = true;
		// el.__vue_vevent_isdown = true;
		if (evt.touches.length <= 1) {
			return;
		}
		var x0 = parseInt(evt.touches[0].clientX);
		var y0 = parseInt(evt.touches[0].clientY);
		var x1 = parseInt(evt.touches[1].clientX);
		var y1 = parseInt(evt.touches[1].clientY);

		var d1 = Math.abs(x1 - x0) + Math.abs(y0 - y1);
		this.scaleGap = d1;
	}

	private ontouchmove(evt) {
		if (!this.isDown) {
			return;
		}
		if (evt.touches.length <= 1) {
			return;
		}

		var x0 = parseInt(evt.touches[0].clientX);
		var y0 = parseInt(evt.touches[0].clientY);
		var x1 = parseInt(evt.touches[1].clientX);
		var y1 = parseInt(evt.touches[1].clientY);

		var d0 = Math.floor(this.scaleGap);
		var d1 = Math.abs(x1 - x0) + Math.abs(y0 - y1);

		if (Math.abs(d1 - d0) < 20) {
			return;
		}

		this.scaleGap = d1;

		var newEvent = this.dealTouchEvt(evt);
		if (d1 > d0) {
			newEvent.wheelDelta = 120;
		} else {
			newEvent.wheelDelta = -120;
		}
		this.cb && this.cb.call(this.target, newEvent);
	}

	private ontouchend(evt) {
		this.isDown = false;
	}

}