
import Vue from 'vue'
// import { Store } from 'vuex'
import Vuex from 'vuex'
// import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import axios from 'axios'
import App from 'src/App.vue'
// import Login from 'src/components/login/Login.vue'
import Lang from 'src/lang/Lang'
// import MainCtl from 'src/control/MainCtl'
import MainStore from 'src/model/MainStore'
import MainModel from 'src/model/MainModel'
import VueHub from './sdk/tsHelp/vue/VueHub';
import VueVEvent from './sdk/tsHelp/vue/VueVEvent';
// import IniFileCtl from './sdk/tsHelp/util/IniFileCtl';
import TimeFormat from './sdk/tsHelp/util/TimeFormat';
import IniFileCtl from 'src/sdk/tsHelp/util/IniFileCtl';
// import VueUICtl from './sdk/tsHelp/vue/uiCtl/VueUICtl';

export default class VueInit {
	static ins: VueInit = null;
	vue: Vue = null;

	constructor() {
		VueInit.ins = this;

		if (MainModel.ins.baseUrl == "") {
			var url = window.location.href;
			url = url.replace(/#.*/, "");
			url = url.replace(/\?.*/, "");
			url = url.replace(/[^\/]*\.html.*/, "");
			url = url.replace(/([^\/])$/, "$1/");
			MainModel.ins.baseUrl = url;
			MainModel.ins.domName = url.match(/(?:[a-z]*:\/\/)([^:]*)(?:.*)/)[1] || "";
			MainModel.ins.port = url.match(/(?:[a-z]*:\/\/)(?:[^:]*:?)([^\/]*)(?:.*)/)[1] || "";
			// console.info(url.match(/(?:[a-z]*:\/\/)(?:[^:]*:?)([^\/]*)(?:.*)/));
		}

		axios.defaults.withCredentials = true;
		// axios.defaults.changeOrigin = true;

		// Vue.config.warnHandler = ()=>{};
		Vue.config.productionTip = false;
		Vue.use(Vuex as any);
		// Vue.use(VueResource as any);
		Vue.use(VueRouter as any);
		Vue.use(VueHub as any);
		Vue.use(VueVEvent as any);
	}

	async run(router: any) {
		await this.getConfigFile();
		
		try {
			window["lang"] = Lang.ins;
			// Vue.use(Vuex as any);

			Lang.ins.switchLang(MainModel.ins.language);
			// this.initLang();

			MainStore.ins.init();
			var store = MainStore.ins.store;

			//是否显示
			Vue.directive('visibility', {
				inserted: function (el, data) {
					el.style.visibility = data.value ? 'visible' : 'hidden';
				},
				update: function (el, data) {
					el.style.visibility = data.value ? 'visible' : 'hidden';
				}
			});

			//禁止拖拽
			Vue.directive('noDrag', {
				inserted: function (el) {
					el.ondragstart = () => false;
				}
			});

			//禁止语法检查
			Vue.directive('noSpell', {
				inserted: function (el) {
					el.setAttribute("autocomplete", "off");
					el.setAttribute("autocorrect", "off");
					el.setAttribute("autocapitalize", "off");
					el.setAttribute("spellcheck", "false");
				}
			});

			//left
			Vue.directive('left', {
				inserted: function (el, data) {
					el.style.left = data.value + 'px';
				},
				update: function (el, data) {
					el.style.left = data.value + 'px';
				}
			});

			//top
			Vue.directive('top', {
				inserted: function (el, data) {
					el.style.top = data.value + 'px';
				},
				update: function (el, data) {
					el.style.top = data.value + 'px';
				}
			});

			this.vue = new Vue({
				store,
				router,
				el: '#app',
				components: { App },
				template: '<App/>'
			});
			
		} catch (ex) {
			console.info("init error", ex);
		}
	}

	async getConfigFile() {
		var cfgFileUrl = `${MainModel.ins.baseUrl}static/data/config.ini`;
		var rst = await axios.get(cfgFileUrl);

		try {
			var cfg = IniFileCtl.parse(rst.data);
			for (var key in cfg) {
				if (!(key in MainModel.ins)) {
					continue;
				}
			}
			MainModel.ins[key] = cfg[key];
		} catch (ex) { }
	}

	// initLang() {
	// 	window["lang"] = Lang.ins;
	// 	var weekFormat = {
	// 		get 1() { return Lang.ins.week1; },
	// 		get 2() { return Lang.ins.week2; },
	// 		get 3() { return Lang.ins.week3; },
	// 		get 4() { return Lang.ins.week4; },
	// 		get 5() { return Lang.ins.week5; },
	// 		get 6() { return Lang.ins.week6; },
	// 		get 7() { return Lang.ins.week7; }
	// 	};
	// 	TimeFormat.weekFormat = weekFormat;

	// 	// 初始化日期控件
	// 	// try {
	// 	// 	$.fn.datetimepicker.dates['zh'] = {
	// 	// 		days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
	// 	// 		daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
	// 	// 		daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
	// 	// 		months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
	// 	// 		//months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
	// 	// 		monthsShort: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
	// 	// 		meridiem: ["上午", "下午"],
	// 	// 		//suffix: ["st", "nd", "rd", "th"], 
	// 	// 		today: "今天"
	// 	// 	};
	// 	// } catch (ex) { }
	// }
}