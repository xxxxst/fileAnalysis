
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { directive, App } from './v2c/IVue';

export default class VueVDrop {
	static pluginInjectKey = "_$_vdrop_";

	static install(vueApp: App<Element>, options) {
		function updateData(el, data, tag) {
			if (!data.value) {
				return;
			}
			el[VueVDrop.pluginInjectKey] = el[VueVDrop.pluginInjectKey] || {};
			el[VueVDrop.pluginInjectKey].tag = data.instance || tag.context;
			el[VueVDrop.pluginInjectKey].value = data.value;
		}

		function ondragenter(e) {
			e.preventDefault();
			e.stopPropagation();
		}

		function onDrop(this: HTMLDivElement, e) {
			e.preventDefault();
			e.stopPropagation();
			if (!this || !this[VueVDrop.pluginInjectKey]) {
				return;
			}
			var val = this[VueVDrop.pluginInjectKey].value;
			if (typeof (val) == "function") {
				val.call(this[VueVDrop.pluginInjectKey].tag, e);
			}
		}

		directive(vueApp, 'vdrop', {
			mounted: function (el, data: any, tag: any) {
				updateData(el, data, tag);
				el.addEventListener("dragenter", ondragenter);
				el.addEventListener("dragover", ondragenter);
				el.addEventListener("dragleave", ondragenter);
				el.addEventListener("drop", onDrop);
			},
			updated: function(el, data: any, tag: any) {
				updateData(el, data, tag);
			},
			unmounted: function (el, data: any, tag: any) {
				el.removeEventListener("dragenter", ondragenter);
				el.removeEventListener("dragover", ondragenter);
				el.removeEventListener("dragleave", ondragenter);
				el.removeEventListener("drop", onDrop);
				delete el[VueVDrop.pluginInjectKey];
			}
		})
	}
}