
import DataCtl from '@/control/DataCtl';
import ConfigCtl from '@/control/ConfigCtl';

export default class MainCtl {
	static ins: MainCtl = new MainCtl();

	isInit = false;
	isStop = false;

	dataCtl = new DataCtl();
	cfgCtl = new ConfigCtl();

	init() {
		if (this.isInit) {
			return;
		}

		this.cfgCtl.init();
	}

	clear() {
		this.cfgCtl.clear();
	}

}