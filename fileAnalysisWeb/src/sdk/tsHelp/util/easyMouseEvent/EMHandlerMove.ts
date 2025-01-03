
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerMove extends EMHandlerBase {
	type: EMType = "move";

	createHandler() {
		return new EMHandlerMove();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousemove", this.onmousemove);
		} else {
			this.comListen(this.element, "touchmove", this.ontouchmove);
		}
	}

	off(_element: any, _cb: Function) {
		this.comClear();
	}

	onmousemove(evt) {
		this.cb && this.cb.call(this.target, evt);
	}

	ontouchmove(evt) {
		var newEvent = this.dealTouchEvt(evt);
		this.cb && this.cb.call(this.target, newEvent);
	}

}