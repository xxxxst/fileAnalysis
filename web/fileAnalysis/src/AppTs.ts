
//app

import Vue from "vue";
// import Vuex, { Store } from 'vuex'
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator'
import Component from "vue-class-component";
// import { State, Getter, Action, Mutation, namespace } from 'vuex-class'
import { SState, state } from 'src/model/MainStore'
import { Size } from './model/MainModel';

// declare var $: any;

@Component({ components: {} })
export default class App extends Vue {
	@SState("lang.webTitle") webTitle

	@SState("winSize") winSize: Size;
	@SState("domSize") domSize: Size;

	//title
	@Watch("webTitle", { immediate: true })
	webTitleChanged() {
		document.title = this.webTitle;
	}

	created() {
		// $(window).resize(this.onSizeChanged);
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
