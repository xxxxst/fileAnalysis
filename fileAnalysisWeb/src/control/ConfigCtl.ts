
import { Vue, vset } from '@/sdk/tsHelp/vue/v2c/IVue';

import { state } from '@/store/MainStore';
import MainCtl from '@/control/MainCtl';

export default class ConfigCtl {
	isStop = false;
	needSaveConfig = false;

	get dataCtl() {
		return MainCtl.ins.dataCtl
	}
	
	async init() {

		// state.log = "" + state.isAndroid + "," + state.isIos + "," + navigator.userAgent;

		this.isStop = false;

		state.supportDb = await this.dataCtl.init();

		await this.loadConfig();

		this.aniSaveData();
	}
	
	async clear() {
		this.isStop = true;
	}

	async loadConfig() {
		var rst = this.toObj(await this.dataCtl.loadData("config"));
		if (!rst) {
			return;
		}

		var tmp = this.formatConfig(state.cfgMd, rst);

		this.lockDataChangedInner();
		state.cfgMd = tmp;
		this.unlockDataChangedInner();
		// console.info(state.cfgMd);
	}

	unlockDataChangedInner() {
		Vue.nextTick(() => {
			state.setSaveDataInner = false;
		});
	}

	lockDataChangedInner() {
		state.setSaveDataInner = true;
	}

	toObj(text: string) {
		try {
			return JSON.parse(text);
		} catch (ex) { }
		return null;
	}

	async waitSaveConfig() {
		this.needSaveConfig = true;
	}

	async saveConfig() {
		await this.dataCtl.saveData("config", JSON.stringify(state.cfgMd));
	}

	async saveData() {
		if (this.needSaveConfig) {
			console.log("saveConfig");
			await this.saveConfig();
		}
		this.needSaveConfig = false;
	}

	async aniSaveData() {
		if (this.isStop) {
			return;
		}

		await this.sleep(2000);
		await this.saveData();

		this.aniSaveData();
	}

	formatConfig(originMd, newMd) {
		var rst: any = {};
		for (var key in originMd) {
			rst[key] = originMd[key];
		}

		for (var key in newMd) {
			if (key in originMd) {
				rst[key] = newMd[key];
			}
		}
		return rst;
	}

	async sleep(time) {
		return new Promise((rsv) => {
			setTimeout(() => {
				rsv();
			}, time);
		});
	}
}