
//app

import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

import { Size } from './model/MainModel';

// declare var $: any;

@Comp({})
export default class App extends Vue {
	@State("lang.webTitle") webTitle

	@State() winSize: Size;
	@State() domSize: Size;

	//title
	@Watch(IMMEDIATE)
	webTitleChanged() {
		document.title = this.webTitle;
	}

	created() {
		if (document.addEventListener) {
			window.addEventListener("resize", () => this.onSizeChanged(), false);
		} else {
			window["attachEvent"]("resize", () => this.onSizeChanged());
		}
	}

	mounted() {
		this.onSizeChanged();
	}

	onSizeChanged() {
		// this.winSize = { width: document.body.clientWidth, height: document.body.clientHeight };
		this.winSize = { width: window.outerWidth, height: window.outerHeight };
		this.domSize = { width: document.body.clientWidth, height: document.body.clientHeight };
		// console.info("aa", this.winWidth);
	}
};
