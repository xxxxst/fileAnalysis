
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { directive, App } from './v2c/IVue';

export default class VueVStyle {
	static install(vueApp: App<Element>, options) {
		function updateStyle(el, data) {
			var style = el.style;
			if (typeof (data.value) == "object") {
				for (var key in data.value) {
					el.style[key] = data.value[key];
				}
			} else if (typeof (data.value) == "string") {
				el.setAttribute("style", data.value);
			}
		}

		directive(vueApp, 'vstyle', {
			mounted: function (el, data: any, tag: any) {
				updateStyle(el, data);
			},
			updated: function(el, data: any, tag: any) {
				updateStyle(el, data);
			},
			unmounted: function (el, data: any, tag: any) {

			}
		})
	}
}
