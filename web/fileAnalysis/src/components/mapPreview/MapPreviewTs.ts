
//MapPreview
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";

import { SState } from 'src/model/MainStore';
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import FileCache from 'src/control/FileCache';
import { FileStruct } from 'src/model/FileStruct';

class RenderRow {
	name = "";
	value = "";
}

class RenderStruct {
	name = "";
	data: FileStruct = null;
	rowCount = 0;
	height = 0;
	width = 0;
	left = 0;
	top = 0;

	attrs: RenderRow[] = [];
}

@Component({ components: { }})
export default class MapPreview extends Vue {
	@Prop({type: Array, default: ()=>[]}) data:FileStruct[];
	
	svgWidth = 100;
	svgHeight = 100;

	renderData:RenderStruct[] = [];

	@VIgnore()
	fileCache: FileCache = null;

	@Watch("data", {immediate:true, deep:true})
	onDataChanged() {
		var arr = [];
		var pos = 30;
		var rowHeight = 20;
		var verGap = 20;
		for(var i = 0; i < this.data.length; ++i) {
			var md = new RenderStruct();
			md.data = this.data[i];
			md.name = this.data[i].name;
			md.rowCount = this.data[i].attrs.length;
			md.top = pos;
			md.left = 100;

			for(var j = 0; j < this.data[i].attrs.length; ++j) {
				var row = new RenderRow();
				var attr = this.data[i].attrs[j];
				row.name = attr.name;
				md.attrs.push(row);
			}

			arr.push(md);

			pos += (md.rowCount + 1) * rowHeight + verGap;
		}

		this.renderData = arr;
		// console.info(arr);
	}

	created() {

	}

	mounted () {
		
	}

	destroyed () {
		
	}


}
