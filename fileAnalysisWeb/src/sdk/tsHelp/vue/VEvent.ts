
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { createDecorator, Vue } from './v2c/IVueClassComponent';

interface IVEventHandler {
	target: any;
	cb: Function;
}

var VEventObj = new class {
	mapHandler: Record<string, IVEventHandler[]> = {};

	regist(name, target, cb) {
		var arr = (this.mapHandler[name] || (this.mapHandler[name] = []));
		arr.push({ target, cb });
	}

	unregist(name, target, cb) {
		var arr = this.mapHandler[name];
		if (!arr) {
			return;
		}

		for (var i = 0; i < arr.length; ++i) {
			if (arr[i].target == target && arr[i].cb == cb) {
				arr.splice(i, 1);
				break;
			}
		}
	}
}

function VEvent(name?: string) {
	if (name === undefined || name === null) {
		name = "";
	}
	return (target: Vue, key: string, descriptor: any) => {
		if (name == "") {
			var len = "Changed".length;
			if (key.indexOf("Changed") != key.length - len) {
				console.warn("[VEvent] use default name, function name should end with 'Changed'");
				return;
			}
			name = key.substr(0, key.length - len);
		}
		createDecorator((componentOptions, handler) => {
			var mixins = componentOptions.mixins || (componentOptions.mixins = []);

			mixins.push({
				created() {
					VEventObj.regist(name, this, this[key]);
				},
				unmounted() {
					VEventObj.unregist(name, this, this[key]);
				}
			});
		})(target, null);

	}
}

VEvent.regist = function (name: string, target: any, cb: Function) {
	VEventObj.regist(name, target, cb);
}

VEvent.unregist = function (name: string, target: any, cb: Function) {
	VEventObj.unregist(name, target, cb);
}

VEvent.emit = function (name: string, ...args) {
	var arr = VEventObj.mapHandler[name];
	if (!arr) {
		return;
	}

	for (var i = 0; i < arr.length; ++i) {
		arr[i].cb.apply(arr[i].target, args);
	}
}

export default VEvent;
