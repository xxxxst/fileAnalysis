
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

@Comp({}, { inheritAttrs: false })
export default class IcoButton extends Vue {
	@Prop() title;
	@Prop() className;
	@Prop() size = 24;
	@Prop() padding = 0;
	@Prop() remUnit = 100;
	@Prop() color = "#fff";
	@Prop() overColor = "#65ccc7";
	@Prop() isSelect = false;

	isOver = false;

	get iconStyle() {
		var rst = {
			color: (this.isOver || this.isSelect) ? this.overColor : this.color,
			fontSize: (this.size - this.padding * 2) / this.remUnit + "rem",
			lineHeight: (this.size - this.padding * 2) / this.remUnit + "rem",
		}

		return rst;
	}

	created() {

	}

	mounted() {

	}

	onClick(evt) {
		this.$emit("click", evt);
	}

	onHover(evt) {
		console.info(evt);
	}

}
