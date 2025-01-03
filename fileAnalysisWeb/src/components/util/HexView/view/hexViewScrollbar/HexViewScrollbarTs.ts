
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

export class HexViewScrollbarMd {
	position = 0;
	contentSize = 0;
	count = 0;

	onChanging: Function = null;
	onChanged: Function = null;
}

@Comp({})
export default class HexViewScrollbar extends Vue {
	@Prop() model = new HexViewScrollbarMd();

	contentStyle = new class {
		top = "0";
		height = "0";
	}

	position = 0;

	isDown = false;
	downPos = 0;
	downCursorPos = { x: 0, y: 0 };

	@Watch(IMMEDIATE | DEEP)
	modelChanged() {
		this.contentStyle.height = this.calcContentSize();
		this.contentStyle.top = this.calcContentPos();
	}

	private calcContentSize() {
		var md = this.model;
		if (md.contentSize >= 100) {
			return "0";
		}
		return md.contentSize + "%";
	}

	private calcContentPos() {
		var md = this.model;
		return (100 - md.contentSize) * (this.position / md.count) + "%";
	}

	created() {

	}

	mounted() {
		document.addEventListener("mousemove", this.anoOnMousemove);
		document.addEventListener("mouseup", this.anoOnMouseup);
	}

	destroyed() {
		document.removeEventListener("mousemove", this.anoOnMousemove);
		document.removeEventListener("mouseup", this.anoOnMouseup);
	}

	onMousedown(evt) {
		// console.info(evt);
		this.downCursorPos.x = evt.pageX;
		this.downCursorPos.y = evt.pageY;
		this.downPos = this.position;
		this.isDown = true;
	}

	private anoOnMousemove = (e) => this.onMousemove(e);
	private onMousemove(evt) {
		if (!this.isDown) {
			return;
		}

		this.updatePosByDrag(evt.pageX, evt.pageY);
	}

	private updatePosByDrag(x, y) {
		var md = this.model;
		var ele = this.$el as HTMLDivElement;
		var canMovePx = 0;
		canMovePx = ele.clientHeight * (1 - this.model.contentSize / 100);

		// console.info(canMovePx);
		if (canMovePx <= 0) {
			return;
		}
		var newPos = 0;
		var gap = 0;
		gap = y - this.downCursorPos.y;

		newPos = this.downPos + (gap / canMovePx) * md.count;
		if (newPos > md.count) {
			newPos = md.count;
		} else if (newPos < 0) {
			newPos = 0;
		}

		if (newPos == this.position) {
			return;
		}
		this.position = newPos;
		// console.info(newPos, this.downPos, gap, canMovePx);

		this.updatePosStyle();
		md.onChanging && md.onChanging(this.position);
	}

	setValue(val) {
		var md = this.model;

		if (val > md.count) {
			val = md.count;
		} else if (val < 0) {
			val = 0;
		}

		if (val == this.position) {
			return;
		}
		this.position = val;

		this.updatePosStyle();
		md.onChanging && md.onChanging(this.position);
	}

	getValue() {
		return this.position;
	}

	private updatePosStyle() {
		var md = this.model;
		this.contentStyle.top = this.calcContentPos();
	}

	private anoOnMouseup = (e) => this.onMouseup(e);
	private onMouseup(evt) {
		if (!this.isDown) {
			return;
		}

		this.isDown = false;
		this.updatePosByDrag(evt.pageX, evt.pageY);

		var md = this.model;
		md.onChanged && md.onChanged(this.position);
	}
}