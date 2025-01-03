
// Vue插件-提供父子组件双向通信的能力
// 绑定行为在mounted()事件之前触发
import Vue from "vue";

export default class VueHub{
	static install(vue:Vue, options){
		//将父组件的属性绑定到子组件上
		Vue.directive('hub', {
			bind: function (el, data, tag:any) {
				try {
					Object.defineProperty(tag.child, data.arg, {
						enumerable: true,
						configurable: true,
						get: () => { return tag.context[data.expression]; },
						set: (value:any) => { tag.context[data.expression] = value; },
					});
				} catch (ex) { }
			}
		});

		//将子组件的属性绑定到父组件上
		Vue.directive('rhub', {
			bind: function (_, data, tag:any) {
				try {
					Object.defineProperty(tag.context, data.expression, {
						enumerable: true,
						configurable: true,
						get: () => { return tag.child[data.arg]; },
						set: (value:any) => { tag.child[data.arg] = value; },
					});
				} catch (ex) { }
			}
		});
	}
}