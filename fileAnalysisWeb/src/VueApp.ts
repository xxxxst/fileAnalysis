
// import { App, createApp, h } from 'vue';
import { Vue, App, createApp } from '@/sdk/tsHelp/vue/v2c/IVue';
// import Vue from 'vue';

export default class VueApp {
	static rootComp = null;
	// static app: App<Element> = createApp({
	// 	render() {
	// 		return h(VueApp.rootComp);
	// 	}
	// });
	static app: App<Element> = createApp(()=>VueApp.rootComp);

	// static app = Vue;

	static use(this: any, ...args) {
		this.app.use.apply(this, args);
	}
}
