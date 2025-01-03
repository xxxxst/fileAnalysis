
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

export class LineNumberMd {
	start = 0;
	count = 1;
	fontSize = 14;
	height = 19;
	width = 37;
	activeLine = 0;
}

@Comp({})
export default class LineNumberBox extends Vue {
	@Prop() model = new LineNumberMd();

	get lstLines() {
		var rst = [];
		var md = this.model;
		for(var i = 0; i < md.count; ++i) {
			rst.push(md.start + i + 1);
		}
		return rst;
	}

	rootStyle = new class {
		width = "37px";
	};

	linStyle = new class {
		height = "19px";
	};

	noStyle = new class {
		width = "21px";
	};

	@Watch(IMMEDIATE | DEEP)
	modelChanged() {
		var md = this.model;
		var noWidth = md.fontSize + 7;
		this.rootStyle.width = md.width + "px";
		this.linStyle.height = md.height + "px";
		this.noStyle.width = noWidth + "px";
	}

	// get linStyle() {
	// 	var obj: any = { };
	// 	var md = this.model;
		
	// 	// obj.fontSize = md.height + "px";
	// 	obj.height = md.height + "px";

	// 	return obj;
	// }

	created() {
		
	}
	
	mounted() {

	}
}