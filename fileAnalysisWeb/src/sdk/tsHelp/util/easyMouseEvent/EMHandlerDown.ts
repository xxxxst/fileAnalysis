
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerDown extends EMHandlerBase {
	type: EMType = "down";

	createHandler() {
		return new EMHandlerDown();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousedown", this.onmousedown);
		} else {
			this.comListen(this.element, "touchstart", this.ontouchstart);
		}
	}

	off(_element: any, _cb: Function) {
		this.comClear();
	}

	onmousedown(evt) {
		this.cb && this.cb.call(this.target, evt);
	}

	ontouchstart(evt) {
		var newEvent = this.dealTouchEvt(evt);
		this.cb && this.cb.call(this.target, newEvent);
	}

}