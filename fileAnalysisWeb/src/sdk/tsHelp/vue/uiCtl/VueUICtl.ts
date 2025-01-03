
// Vue插件-绑定ui control
import Vue from "vue";

export default class VueUICtl{
	static install(vue:Vue, options){
		Vue.directive('uiCtl', {
			bind: function (el, data, tag) {
				// var arr = data.rawName.split(".");
				// // console.info("11", el, data, tag, arr);
				// try {
				// 		data.value.bindElement(el);
				// } catch (ex) { }
			}
		});
	}
}