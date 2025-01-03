
import { createStore, Store } from '@/sdk/tsHelp/vue/v2c/IVuex';
import { reactive } from '@/sdk/tsHelp/vue/v2c/IVue';

import Lang from '@/lang/Lang'
import { ConfigMd } from '@/model/MainModel';

class StateVue {
	//语言
	lang = Lang.ins;

	//窗口尺寸
	winSize = { width: 0, height: 0 };
	domSize = { width: 0, height: 0 };

	supportDb = true;
	setSaveDataInner = false;
	cfgMd = new ConfigMd();

	mapTypeLen: Record<string, number> = {};

	isDebug = false;
	cdn = true;
}

export const state = reactive(new StateVue());

export default new class MainStore {
	store: Store<StateVue> = null;
	create() {
		// var state = new StateVue();
		// this.state = state;
		this.store = createStore({
			state,
		});
		// console.info(store);
		return this.store;
		// return createStore({
		// 	state,
		// });
	}
}
