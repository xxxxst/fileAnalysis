
/**
 * vue2
*/
import Vue from 'vue';
import { DirectiveOptions } from 'vue/types/umd';
import { DirectiveFunction } from 'vue';

export { Vue };

export function markRaw(obj) {
	if (typeof (obj) != "object") {
		return obj;
	}
	obj._isVue = true;
	return obj;
}

export function reactive<T>(obj: T): T {
	return Vue.observable(obj);
}

interface IDirectiveOptions extends DirectiveOptions {
	beforeMount?: DirectiveFunction;
	mounted?: DirectiveFunction;
	updated?: DirectiveFunction;
	unmounted?: DirectiveFunction;
	bind?: undefined;
	inserted?: undefined;
	update?: undefined;
	componentUpdated?: undefined;
	unbind?: undefined;
}

export function directive(app: any, id: string, definition?: IDirectiveOptions | DirectiveFunction) {
	var opt = definition as any;
	if (typeof (opt) == "object") {
		opt.beforeMount && (opt.bind = opt.beforeMount);
		opt.mounted && (opt.inserted = opt.mounted);
		opt.updated && (opt.update = opt.updated);
		opt.unmounted && (opt.unbind = opt.unmounted);
	}
	Vue.directive(id, opt);
}

type App<T> = typeof Vue;
export { App };
var getCompCache = null;
export function createApp(getComp: () => Vue) {
	getCompCache = getComp;
	return Vue;
}

export function mount(app: any, mapUse: any) {
	var opt = {
		render: (h) => h(getCompCache && getCompCache()),
	};
	for (var key in mapUse) {
		opt[key] = mapUse[key];
	}
	return new Vue(opt).$mount('#app-entry');
}

export function getVueProptotype(app?: any) {
	return Vue.prototype;
}

export function vset(target, key, value) {
	Vue.set(target, key, value);
}
