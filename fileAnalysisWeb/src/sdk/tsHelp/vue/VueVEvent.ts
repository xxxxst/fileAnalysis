
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

//virtual mouse event
import { directive, App } from './v2c/IVue';
import EasyMouseEvent from '../util/easyMouseEvent/EasyMouseEvent';
import { EMType } from '../util/easyMouseEvent/EMMd';

export default class VueVEvent {
	static install(vueApp: App<Element>, options) {
		directive(vueApp, 'vmouse', {
			mounted: function (el, data: any, tag: any) {
				var name = data.arg;
				VueVEvent.on(el, name, data.value, data.instance || tag.context);
			},
			unmounted: function (el, data: any, tag: any) {
				var name = data.arg;
				VueVEvent.off(el, name, data.value, data.instance || tag.context);
			}
		});
	}

	static on(el, name: EMType, cb, target = null) {
		this.listen(el, name, cb, target);
	}

	static listen(el, name: EMType, cb, target = null) {
		EasyMouseEvent.on(el, name, cb, target);
	}

	static off(el, name: EMType, cb, target = null) {
		EasyMouseEvent.off(el, name, cb, target);
	}

}
