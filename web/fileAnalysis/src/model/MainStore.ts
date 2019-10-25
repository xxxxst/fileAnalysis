
import Vue from "vue";
import Component, { createDecorator } from 'vue-class-component';
import { Store } from 'vuex'
import Lang from 'src/lang/Lang'

class StateVue {
	//语言
	lang = Lang.ins;

	//窗口尺寸
	winSize = { width: 0, height: 0 };
	domSize = { width: 0, height: 0 };

	isDebug = false;
	cdn = true;
}

export const state = new StateVue();

export default class MainStore {
	static ins: MainStore = new MainStore();

	store: Store<any> = null;
	init() {
		this.store = new Store({
			state: state,
			// get state(){debugger; return state;}
		});
	}
}

//state装饰器
export function SState(target?: any, key?: any, descriptor?: any): any {
	var targetKey = target;

	function create(targetSub: any, keySub: any, descriptor?: any) {
		// set state
		function setState(obj) {
			//string
			if (typeof targetKey === 'string') {
				targetKey = targetKey.trim();

				var arr = targetKey.split(".");
				var lastAttr = arr[arr.length - 1];

				var tmp = state;
				for (var i = 0; i < arr.length - 1; ++i) {
					tmp = tmp[arr[i]];
				}

				Object.defineProperty(obj, keySub, {
					enumerable: true,
					configurable: true,
					get: () => { return tmp[lastAttr]; },
					set: (value: any) => { tmp[lastAttr] = value; },
				});
			} else if (targetKey instanceof Function) {
				//function
				Object.defineProperty(obj, keySub, {
					enumerable: true,
					configurable: true,
					get: () => {
						return target(state);
					},
				});
			}
		}

		if (targetSub instanceof Vue) {
			createDecorator((componentOptions, handler) => {
				var mixins = componentOptions.mixins || (componentOptions.mixins = []);

				mixins.push({
					data: function () {
						// var rst = {};
						setState(this);

						return {};
					}
				});

			})(targetSub, keySub, descriptor);
		} else {
			setState(targetSub);
		}
	};

	// @Des
	if (key != null) {
		targetKey = key;
		create(target, targetKey);

		return;
	}

	// @Des(...args)
	return create;
}