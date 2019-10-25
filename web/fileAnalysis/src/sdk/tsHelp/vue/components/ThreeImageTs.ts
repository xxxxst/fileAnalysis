
//app

import Vue from "vue";
// import Vuex, { Store } from 'vuex'
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator'
import Component from "vue-class-component";
// import { State, Getter, Action, Mutation, namespace } from 'vuex-class'

@Component({ components: {} })
export default class ThreeImage extends Vue {
	@Prop({ type: String, default: "" }) baseUrl: string;
	@Prop({ type: String, default: "" }) url: string;
	@Prop({ type: String, default: "" }) startUrl: string;
	@Prop({ type: String, default: "" }) midUrl: string;
	@Prop({ type: String, default: "" }) endUrl: string;
	@Prop({ type: Number, default: 0 }) leftGap: string;
	@Prop({ type: Number, default: 0 }) rightGap: string;
	@Prop({ type: Object, default: { x: 0, y: 0 } }) midGap: { x: number, y: number };

	get RealStartUrl() {
		return this.baseUrl + this.startUrl;
	}
	get RealMidUrl() {
		return this.baseUrl + this.midUrl;
	}
	get RealEndUrl() {
		return this.baseUrl + this.endUrl;
	}

	@Watch("url")
	onUrlChanged() {
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
