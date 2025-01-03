
/**
 * vue3
*/

// import { App, createApp as OriginCreateApp, h } from 'vue';
// import { Vue as OriginVue } from 'vue-class-component';

// export function createApp(getComp: () => Vue) {
// 	return OriginCreateApp({
// 		render() {
// 			return h(getComp());
// 		}
// 	});
// }

// export function mount(app: any, mapUse: any) {
// 	for (var key in mapUse) {
// 		app.use(mapUse[key])
// 	}
// 	return app.mount('#app-entry');
// }

// interface IMessage {
// 	success(test: string, time?: number);
// 	error(test: string, time?: number);
// 	info(test: string, time?: number);
// 	warning(test: string, time?: number);
// }

// declare class SelfVueInstance extends OriginVue {
// 	$message: IMessage;
// 	$confirm: any;
// }

// declare interface ISelfVue {
// 	new(...args): SelfVueInstance;
// 	prototype: SelfVueInstance;
// }

// type IVue = ISelfVue & typeof OriginVue;

// export const Vue: IVue = OriginVue as any;

// export function directive(app: any, id: string, definition?: any) {
// 	app.directive(id, definition);
// }

// export function getProptotype(app?: any) {
// 	return app.config.globalProperties;
// }

export function vset(target, key, value) {
	target[key] = value;
}
