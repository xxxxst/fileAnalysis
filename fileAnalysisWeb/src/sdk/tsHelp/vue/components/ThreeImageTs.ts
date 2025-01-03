
//app

import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';


@Comp({})
export default class ThreeImage extends Vue {
	@Prop() baseUrl = "";
	@Prop() url = "";
	@Prop() startUrl = "";
	@Prop() midUrl = "";
	@Prop() endUrl = "";
	@Prop() leftGap = 0;
	@Prop() rightGap = 0;
	@Prop() midGap = { x: 0, y: 0 };

	get RealStartUrl() {
		return this.baseUrl + this.startUrl;
	}
	get RealMidUrl() {
		return this.baseUrl + this.midUrl;
	}
	get RealEndUrl() {
		return this.baseUrl + this.endUrl;
	}

	@Watch()
	urlChanged() {
		var arrUrl = this.url.split(",");
		if (arrUrl.length != 3) {
			return;
		}

		arrUrl[0] = arrUrl[0].trim();

		var baseUrlTemp = "";
		var idx = arrUrl[0].lastIndexOf("/");
		if (idx >= 0) {
			baseUrlTemp = arrUrl[0].substr(0, idx + 1);
			arrUrl[0] = arrUrl[0].substr(idx + 1);
		}

		this.baseUrl = baseUrlTemp;
		this.startUrl = arrUrl[0].trim();
		this.midUrl = arrUrl[1].trim();
		this.endUrl = arrUrl[1].trim();

	}

	created() {

	}

};
