
//MapPreview
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

import { VIgnore } from '@/sdk/tsHelp/vue/VIgnore';
import FileCache from '@/control/FileCache';
import { FileStruct, StructAddressMd } from '@/model/FileStruct';
import VEvent from '@/sdk/tsHelp/vue/VEvent';
import { EventType } from '@/model/MainModel';

class RenderRow {
	name = "";
	value = "";
}

class RenderStruct {
	// name = "";
	// data: StructAddressMd = null;
	// rowCount = 0;
	// height = 0;
	// width = 0;
	left = 0;
	top = 0;

	data: string[][] = [];

	attrs: RenderRow[] = [];
}

class OverDataStyle {
	left = 0;
	top = 0;
	width = 0;
	height = 0;
}

@Comp({ })
export default class MapPreview extends Vue {
	@State() mapTypeLen: Record<string, number>;
	@State("cfgMd.isHexMode") isShowHex: boolean;

	@Prop() data:StructAddressMd[] = [];
	@Prop() onHightlightChanged:Function = null;
	
	svgWidth = 100;
	svgHeight = 100;
	// isShowHex = false;

	renderData: RenderStruct[] = [];
	selectData: OverDataStyle = new OverDataStyle();
	overData: OverDataStyle = new OverDataStyle();
	
	arrSelectHightlightData = [];
	arrOverHightlightData = [];
	arrHightlightData = [];

	@VIgnore()
	fileCache: FileCache = null;

	bottomY = 0;

	overDataStyle = {
		left: "",
		top: "",
		width: "",
		height: "",
		display: "none",
	}

	selectDataStyle = {
		left: "",
		top: "",
		width: "",
		height: "",
		display: "none",
	}

	@Watch(IMMEDIATE | DEEP)
	dataChanged() {
		var arr = [];
		var pos = 50;
		var rowHeight = 20;
		var verGap = 20;
		var leftStart = 50;
		for(var i = 0; i < this.data.length; ++i) {
			var data = this.data[i].data;
			var rowCount = data.attrs.length;
			var md = new RenderStruct();
			// md.data = this.data[i];
			// md.name = data.name;
			// md.rowCount = rowCount;
			md.top = pos;
			md.left = leftStart;

			var head = [];
			// add head
			var strHead = data.name;
			if(data.len >= 0) {
				strHead = "0x" + data.len.toString(16).toUpperCase() + "-" + strHead;
			}
			head.push(strHead);
			head.push("Desc");
			md.data.push(head);

			var addr = 0;

			for (var j = 0; j < data.attrs.length; ++j) {
				var row = [];
				// add attr name
				row.push("0x" + addr.toString(16) + "-" + data.attrs[j].name);
				row.push(data.attrs[j].desc);

				var len = this.mapTypeLen[data.attrs[j].type] || 0;
				var count = data.attrs[j].arrayLength < 0 ? 1 : data.attrs[j].arrayLength;
				addr += len * count;

				for (var k = 0; k < this.data[i].arrItem.length; ++k) {
					var it2 = this.data[i].arrItem[k];
					// add address to head
					if (j == 0) {
						head.push("0x" + it2.address.toString(16).toUpperCase());
					}

					// add value
					if (j > it2.attrData.length) {
						row.push("");
					} else {
						var val = this.renderValue(it2.attrData[j].values);
						row.push(val);
					}
				}

				md.data.push(row);
			}

			arr.push(md);

			pos += (rowCount + 1) * rowHeight + verGap;
		}

		this.bottomY = pos;

		this.renderData = arr;

		// this.arrSelectHightlightData = [];
		// this.arrOverHightlightData = [];
		// this.arrHightlightData = [];
		// this.selectData = new OverDataStyle();
		// this.overData = new OverDataStyle();
		this.setHeighlightData(new OverDataStyle(), [], false);
		// this.setHeighlightData(new OverDataStyle(), [], true);
		// console.info(arr);
	}

	renderValue(val:any[]) {
		// if(typeof(val) == "string") {
		// 	return "" + val;
		// }

		// if(typeof(val) == "number") {
		// 	return "" + val;
		// }

		var rst = "";
		for(var i = 0; i < val.length; ++i) {
			if(i != 0) { rst += ","; }
			var tmp = val[i];
			if(typeof(tmp) == "number") {
				if (this.isShowHex) {
					var str = tmp.toString(16);
					if (str.indexOf(".") > 0) {
						// float
						str = tmp.toString();
					} else {
						// int
						if (str.substr(0, 1) == "-") {
							str = "-0x" + str.substr(1).toUpperCase();
						} else {
							str = "0x" + str.toUpperCase();
						}
					}
					tmp = str;
				}
			}
			rst += tmp;
		}

		return rst;
	}

	created() {

	}

	mounted() {

	}

	destroyed() {

	}

	onOverData(idx:number, idx2:number, idx3:number) {
		this.hightlightData(idx, idx2, idx3, true);
	}

	onClickData(idx:number, idx2:number, idx3:number) {
		// console.info(this.data[idx]);
		this.hightlightData(idx, idx2, idx3, false);
	}

	hightlightData(idx:number, idxRow:number, idxCol:number, isOver:boolean) {
		var colWidth = 80;
		var colFirstWidth = 100 * 2;
		var headCount = 2;
		var rowHeight = 20;

		var md = this.data[idx];

		var render = this.renderData[idx];
		var left = render.left;
		var top = render.top - 1;

		var rst = new OverDataStyle();
		
		// over struct
		if(idxRow == 0 && idxCol < headCount) {
			rst.left = left;
			rst.top = top + 1;
			rst.width = colFirstWidth + (render.data[0].length - headCount) * colWidth + 2;
			rst.height = rowHeight * render.data.length;

			var hlData = [];
			for(var i = 0; i < md.arrItem.length; ++i) {
				for(var j = 0; j < md.arrItem[i].attrData.length; ++j) {
					var addrIdx = md.arrItem[i].addrIdx;
					hlData.push([addrIdx, j]);
				}
			}

			this.setHeighlightData(rst, hlData, isOver);
			return;
		}

		// over col head
		if(idxRow == 0) {
			rst.left = left + colFirstWidth + (idxCol - headCount) * colWidth + 1;
			rst.top = top + 1;
			rst.width = colWidth + 1;
			rst.height = rowHeight * render.data.length;

			var hlData = [];
			var addrIdx = md.arrItem[idxCol-headCount].addrIdx;
			for(var j = 0; j < md.arrItem[idxCol-headCount].attrData.length; ++j) {
				hlData.push([addrIdx, j]);
			}

			this.setHeighlightData(rst, hlData, isOver);
			return;
		}

		// over row head
		if(idxCol < headCount) {
			rst.left = left;
			rst.top = top + idxRow * rowHeight;
			rst.width = colFirstWidth + (render.data[0].length - headCount) * colWidth + 2;
			rst.height = rowHeight + 1;

			var hlData = [];
			for(var j = 0; j < md.arrItem.length; ++j) {
				var addrIdx = md.arrItem[j].addrIdx;
				hlData.push([addrIdx, idxRow-1]);
			}

			this.setHeighlightData(rst, hlData, isOver);
			return;
		}

		rst.left = left + colFirstWidth + (idxCol - headCount) * colWidth + 1;
		rst.top = top + idxRow * rowHeight;
		rst.width = colWidth + 1;
		rst.height = rowHeight + 1;
		
		var hlData = [];
		hlData.push([md.arrItem[idxCol-headCount].addrIdx, idxRow-1]);

		this.setHeighlightData(rst, hlData, isOver);
	}

	setHeighlightData(rst: OverDataStyle, hlData: any[], isOver:boolean) {
		if(isOver) {
			this.overData = rst;
			this.arrOverHightlightData = hlData;
			
			var arr = [];
			hlData.forEach(it=>arr.push(it));
			this.arrSelectHightlightData.forEach(it=>arr.push(it));
			this.arrHightlightData = arr;
			this.updateOverDataStyle();
		} else {
			this.selectData = rst;
			this.arrSelectHightlightData = hlData;
			this.arrHightlightData = hlData;
			this.updateSelectDataStyle();
		}

		this.onHightlightChanged && this.onHightlightChanged(this.arrHightlightData);
	}

	updateOverDataStyle() {
		this.updateHeightlightDataStyle(this.overData, this.overDataStyle);
	}

	updateSelectDataStyle() {
		this.updateHeightlightDataStyle(this.selectData, this.selectDataStyle);
	}

	updateHeightlightDataStyle(data: OverDataStyle, style) {
		if(data.width == 0) {
			style.display = "none";
			return;
		}

		style.left = data.left + "px";
		style.top = data.top + "px";
		style.width = data.width + "px";
		style.height = data.height + "px";
		style.display = "";
	}

	onOutData() {
		// this.overData = new OverDataStyle();
		// this.updateOverDataStyle();
		this.setHeighlightData(new OverDataStyle(), [], true);
	}

	onClickBack(evt) {
		if(evt.target != this.$el && evt.target != this.$refs.content) {
			return;
		}

		// this.selectData = new OverDataStyle();
		// this.updateSelectDataStyle();
		this.setHeighlightData(new OverDataStyle(), [], false);
	}

	onClickBtnHex() {
		this.isShowHex = !this.isShowHex;
		this.dataChanged();
	}

	onClickJump(evt) {
		var key = evt.key as string;
		var arr = key.split("_");
		if (arr.length != 3) {
			return;
		}
		var arr2 = arr.map(it=>parseInt(it));
		var it = this.renderData[arr2[0]].data[arr2[1]][arr2[2]];
		var addr = parseInt(it);
		VEvent.emit(EventType.jumpHex, addr);
	}

}
