
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";

export class LineNumberMd {
	start = 0;
	count = 1;
	fontSize = 14;
	height = 19;
	activeLine = 0;
}

@Component({ components: { }})
export default class LineNumberBox extends Vue {
	@Prop({ type: Object, default: ()=>new LineNumberMd() }) model: LineNumberMd;

	get lstLines() {
		var rst = [];
		var md = this.model;
		for(var i = 0; i < md.count; ++i) {
			rst.push(md.start + i + 1);
		}
		return rst;
	}

	linStyle = new class {
		height = "19px";
	}

	noStyle = new class {
		width = "21px";
	}

	@Watch("model", { immediate: true, deep: true})
	onModelChanged() {
		var md = this.model;
		var noWidth = md.fontSize + 7;
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