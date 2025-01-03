
import { Vue, directive, mount } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import axios from 'axios';

import ProjApp from '@/ProjApp.vue';
import MainModel from '@/model/MainModel';
import VueVEvent from '@/sdk/tsHelp/vue/VueVEvent';
import VueVHover from '@/sdk/tsHelp/vue/VueVHover';
import VueVStyle from '@/sdk/tsHelp/vue/VueVStyle';
import VueVDrop from '@/sdk/tsHelp/vue/VueVDrop';
import IniFileCtl from '@/sdk/tsHelp/util/IniFileCtl';
import VueApp from '@/VueApp';
import MainMock from "@/test/mock/MainMock";
import IcoButton from '@/components/util/icoButton/IcoButton.vue';

import "@/control/AntDesignImport";

// Comp.prototype.propToModel = true;

window["__debug__"] && (window["Vue"] = Vue as any);
export default class VueInit {
	static ins: VueInit = null;

	constructor() {
		VueInit.ins = this;
	}

	async init() {
		// await this.initLib();
		// init config
		await MainMock.init();
		await VueInit.getConfigFile();

		if (MainModel.ins.baseUrl == "") {
			var url = window.location.href;
			url = url.replace(/#.*/, "");
			url = url.replace(/\?.*/, "");
			url = url.replace(/[^/]*\.html.*/, "");
			url = url.replace(/([^/])$/, "$1/");
			MainModel.ins.baseUrl = url;
			MainModel.ins.domName = url.match(/(?:[a-z]*:\/\/)([^:]*)(?:.*)/)[1] || "";
			MainModel.ins.port = url.match(/(?:[a-z]*:\/\/)(?:[^:]*:?)([^/]*)(?:.*)/)[1] || "";
		}

		axios.defaults.withCredentials = true;

		VueApp.app.use(Vuex as any);
		VueApp.app.use(VueRouter as any);
		VueApp.app.use(VueVEvent as any);
		VueApp.app.use(VueVHover as any);
		VueApp.app.use(VueVStyle as any);
		VueApp.app.use(VueVDrop as any);
		VueApp.app.component("ico-button", IcoButton);
	}

	async run(router: any, store: any) {
		try {
			// window["lang"] = Lang.ins;
			// Lang.ins.switchLang(MainModel.ins.language);

			//禁止拖拽
			directive(VueApp.app, 'noDrag', {
				mounted(el) {
					el.ondragstart = () => false;
				}
			});

			// 禁止选择
			directive(VueApp.app, 'noSelect', {
				mounted(el: any) {
					el.unselectable = "on";
					el.onselectstart = function() { return false; };
				}
			});

			//禁止语法检查
			directive(VueApp.app, 'noSpell', {
				mounted(el) {
					el.setAttribute("autocomplete", "off");
					el.setAttribute("autocorrect", "off");
					el.setAttribute("autocapitalize", "off");
					el.setAttribute("spellcheck", "false");
				}
			});

			VueApp.rootComp = ProjApp;
			mount(VueApp.app, {router, store});
			// new Vue({
			// 	router,
			// 	store,
			// 	render: (h) => h(App),
			// }).$mount('#app-entry');

			// this.vueApp.component("App", App);
			// VueApp.rootComp = App;
			// VueApp.app.use(store).use(router).mount('#app-entry');

		} catch (ex) {
			console.info("init error", ex);
		}
	}

	static async getConfigFile() {
		var cfgFileUrl = `${MainModel.ins.baseUrl}static/data/config.ini`;
		var rst = await axios.get(cfgFileUrl);
		try {
			var cfg = IniFileCtl.parse(rst.data);
			for (var key in cfg) {
				if (!(key in MainModel.ins)) {
					continue;
				}
				MainModel.ins[key] = cfg[key];
			}
		} catch (ex) {

		}
	}
}
