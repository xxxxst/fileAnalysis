
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerDown from './EMHandlerDown';
import EMHandlerBase from './EMHandlerBase';
import EMHandlerUp from './EMHandlerUp';
import EMHandlerScale from './EMHandlerScale';
import EMHandlerClick from './EMHandlerClick';
import EMHandlerLongdown from './EMHandlerLongdown';
import EMHandlerMove from './EMHandlerMove';

export default class EasyMouseEvent {
	static globalInit() {
		EasyMouseEvent.regist(new EMHandlerDown());
		EasyMouseEvent.regist(new EMHandlerUp());
		EasyMouseEvent.regist(new EMHandlerScale());
		EasyMouseEvent.regist(new EMHandlerClick());
		EasyMouseEvent.regist(new EMHandlerLongdown());
		EasyMouseEvent.regist(new EMHandlerMove());
	}

	static mapHandlerFact: Record<string, EMHandlerBase> = {};
	static mapHandler: Record<string, EMHandlerBase[]> = {};

	static regist(handler: EMHandlerBase) {
		this.mapHandlerFact[handler.type] = handler;
		this.mapHandler[handler.type] = [];
	}

	static unregist(handler: EMHandlerBase) {
		delete this.mapHandlerFact[handler.type];
		delete this.mapHandler[handler.type];
	}

	private static createHandler(name: EMType) {
		return this.mapHandlerFact[name].createHandler();
	}

	static on(el, name: EMType, cb, target = null) {
		if (!(name in this.mapHandlerFact)) {
			return;
		}
		var handler = this.createHandler(name);
		this.mapHandler[handler.type].push(handler);
		handler.listen(el, cb, target);
	}

	static off(el, name: EMType, cb, target = null) {
		if (!(name in this.mapHandlerFact)) {
			return;
		}
		var arr = this.mapHandler[name];
		var handler = null;
		for (var i = 0; i < arr.length; ++i) {
			if (arr[i].cb == cb) {
				if (!target || arr[i].target == target) {
					handler = arr[i];
					arr.splice(i, 1);
					break;
				}
			}
		}
		if (!handler) {
			return;
		}
		handler.off(el, cb);
	}
}

EasyMouseEvent.globalInit();