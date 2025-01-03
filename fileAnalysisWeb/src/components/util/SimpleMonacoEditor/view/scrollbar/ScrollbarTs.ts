
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

export class ScrollbarMd {
	isVertical = true;
	position = 0;
	contentSize = 0;
	count = 0;
	// size = 14;
	isMouseOver = false;
	onChanging:Function = null;
	onChanged:Function = null;
}

@Comp({ })
export default class Scrollbar extends Vue {
	@Prop() model = new ScrollbarMd();
	
	// rootStyle = new class {
	// 	width = "14px";
	// 	height = "14px";
	// }

	// get rootStyle() {
	// 	var obj: any = { };
	// 	var md = this.model;

	// 	if(md.isVertical) {
	// 		obj.width = md.size + "px";
	// 		obj.height = "100%";
	// 	} else {
	// 		obj.width = "100%";
	// 		obj.height = md.size + "px";
	// 	}
	// 	return obj;
	// }

	contentStyle = new class {
		left = "0";
		top = "0";
		width = "100%";
		height = "0";
	}

	// get contentStyle() {
	// 	var obj: any = { };
	// 	var md = this.model;

	// 	if(md.isVertical) {
	// 		obj.width = "100%";
	// 		obj.height = md.contentSize + "%";
	// 	} else {
	// 		obj.width = md.contentSize + "%";
	// 		obj.height = "100%";
	// 	}
	// 	return obj;
	// }

	position = 0;

	isDown = false;
	downPos = 0;
	downCursorPos = { x: 0, y: 0 };

	@Watch(IMMEDIATE | DEEP)
	modelChanged() {
		var md = this.model;
		// this.position = md.position;
		// console.info("aaa", md.contentSize, md.count);
		if(md.isVertical) {
			// this.rootStyle.width = md.size + "px";
			// this.rootStyle.height = "100%";
			this.contentStyle.width = "100%";
			this.contentStyle.height = this.calcContentSize();
			this.contentStyle.left = "0";
			this.contentStyle.top = this.calcContentPos();
		} else {
			// this.rootStyle.width = "100%";
			// this.rootStyle.height = md.size + "px";
			this.contentStyle.width = this.calcContentSize();
			this.contentStyle.height = "100%";
			this.contentStyle.left = this.calcContentPos();
			this.contentStyle.top = "0";
		}
	}

	calcContentSize() {
		var md = this.model;
		if(md.contentSize >= 100) {
			return "0";
		}
		return md.contentSize + "%";

		// if(md.contentSize >= md.count) {
		// 	return "0";
		// }
		// return md.contentSize/md.count*100 + "%";
	}

	calcContentPos() {
		var md = this.model;
		return (100-md.contentSize) * (this.position/md.count) + "%";
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

	anoOnMousemove = (e)=>this.onMousemove(e);
	onMousemove(evt) {
		if(!this.isDown) {
			return;
		}

		this.updatePosByDrag(evt.pageX, evt.pageY);
	}

	updatePosByDrag(x, y) {
		var md = this.model;
		var ele = this.$el as HTMLDivElement;
		var canMovePx = 0;
		if(this.model.isVertical) {
			canMovePx = ele.clientHeight * (1 - this.model.contentSize/100);
		} else {
			canMovePx = ele.clientWidth * (1 - this.model.contentSize/100);
		}

		// console.info(canMovePx);
		if(canMovePx <= 0) {
			return;
		}
		var newPos = 0;
		var gap = 0;
		if(this.model.isVertical) {
			gap = y - this.downCursorPos.y;
		} else {
			gap = x - this.downCursorPos.x;
		}

		newPos = this.downPos + (gap / canMovePx) * md.count;
		if(newPos > md.count) {
			newPos = md.count;
		} else if(newPos < 0) {
			newPos = 0;
		}

		if(newPos == this.position) {
			return;
		}
		this.position = newPos;
		// console.info(newPos, this.downPos, gap, canMovePx);

		this.updatePosStyle();
		md.onChanging && md.onChanging(this.position);
	}

	// updateContentSize() {

	// }

	setValue(val) {
		var md = this.model;

		if(val > md.count) {
			val = md.count;
		} else if(val < 0) {
			val = 0;
		}

		if(val == this.position) {
			return;
		}
		this.position = val;
		
		this.updatePosStyle();
		md.onChanging && md.onChanging(this.position);
	}

	getValue() {
		return this.position;
	}

	updatePosStyle() {
		var md = this.model;
		if(md.isVertical) {
			this.contentStyle.top = this.calcContentPos();
			// console.info(this.position, this.contentStyle.top);
		} else {
			this.contentStyle.left = this.calcContentPos();
		}
	}

	anoOnMouseup = (e)=>this.onMouseup(e);
	onMouseup(evt) {
		if(!this.isDown) {
			return;
		}

		this.isDown = false;
		this.updatePosByDrag(evt.pageX, evt.pageY);

		var md = this.model;
		md.onChanged && md.onChanged(this.position);
	}
}