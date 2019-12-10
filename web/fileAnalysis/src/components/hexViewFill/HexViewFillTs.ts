
//HexViewFill
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";

import { SState } from 'src/model/MainStore';
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import { AddressMd } from 'src/model/FileStruct';
import FileCache from 'src/control/FileCache';
import MainModel from 'src/model/MainModel';

class RenderRoot {
	md:AddressMd = null;
	attrs: RenderItem[] = [];
}

class RenderItem {
	highlight = false;
	path = "";
}

@Component({ components: { }})
export default class HexViewFill extends Vue {
	@Prop({ type: Array, default: ()=>[] }) arrAddress: AddressMd[];
	@Prop({ type: Array, default: ()=>[] }) arrHightlightData: any[];
	@Prop({ type: Number, default: 0 }) hexStartRow: number;

	renderData: RenderRoot[] = [];
	renderOverData: RenderItem[] = [];
	mapRenderData: Record<number, RenderRoot> = {};

	@VIgnore()
	fileCache: FileCache = null;

	@Watch("arrAddress", { immediate:true, deep: true })
	@Watch("hexStartRow")
	onAddrChanged() {
		// var fcache = this.getFileCache();
		// if(fcache == null) {
		// 	return;
		// }
		var fileLen = this.getFileLen();
		if(fileLen <= 0) {
			this.renderData = [];
			this.renderOverData = [];
			this.mapRenderData = {};
			return;
		}

		var endRow = Math.floor(fileLen / 16) - 1;
		if(this.hexStartRow + 15 < endRow) {
			endRow = this.hexStartRow + 15;
		}

		var w = 25;
		var h = 18;

		var rst = [];
		var map: Record<number, RenderRoot> = {};
		for(var i = 0; i < this.arrAddress.length; ++i) {
			var startRoot = this.arrAddress[i].realAddr;
			var lenRoot = this.arrAddress[i].len;
			var r1Root = Math.floor(startRoot / 16);
			var r2Root = Math.floor((startRoot + lenRoot - 1) / 16);
			if(r1Root > endRow || r2Root < this.hexStartRow) {
				continue;
			}

			var pos = 0;
			
			var root = new RenderRoot();
			rst.push(root);
			map[i] = root;

			for(var j = 0; j < this.arrAddress[i].attrs.length; ++j) {
				var attr = this.arrAddress[i].attrs[j];
				
				var start = this.arrAddress[i].realAddr + pos;
				var len = attr.len;
				pos += len;
				var r1 = Math.floor(start / 16);
				var r2 = Math.floor((start + len - 1) / 16);
				if(r1 > endRow || r2 < this.hexStartRow) {
					continue;
				}

				var c1 = start - r1 * 16;
				var c2 = (start + len - 1) - r2 * 16;

				var r1 = r1 - this.hexStartRow;
				var r2 = r2 - this.hexStartRow;

				var x1 = c1 * w + 3;
				var y1 = r1 * h;
				var x2 = (c2+1) * w + 3;
				var y2 = (r2+1) * h - 3;

				var md = new RenderItem();
				root.attrs.push(md);

				var str = "";
				if(r1 == r2) {
					str += `${x1},${y1} ${x2},${y1} ${x2},${y2}, ${x1},${y2} ${x1},${y1}`;
					md.path = str;
					continue;
				}

				var x3 = 16 * w + 3;
				var y3 = y2 - (h-3);
				var x4 = 3;
				var y4 = y1 + (h-3);

				str += `${x1},${y1} ${x3},${y1} ${x3},${y3}, ${x2},${y3} ${x2},${y2} ${x4},${y2} ${x4},${y4} ${x1},${y4} ${x1},${y1}`;
				md.path = str;
			}

		}
		// console.info(rst);
		this.mapRenderData = map;
		this.renderData = rst;

		this.onHightlightDataChanged();
	}

	@Watch("arrHightlightData", { immediate:true, deep: true })
	onHightlightDataChanged() {
		var map = this.mapRenderData;
		var hlRst = [];

		for (var i = 0; i < this.arrHightlightData.length; ++i) {
			var it = this.arrHightlightData[i];
			if (!(it[0] in map)) {
				continue;
			}

			var attrs = map[it[0]].attrs;
			if (it[1] >= attrs.length) {
				continue;
			}

			hlRst.push(attrs[it[1]]);
		}

		// console.info(test, map);
		this.renderOverData = hlRst;
	}

	created() {

	}

	mounted () {
		
	}

	destroyed () {
		
	}

	setFileCache(_fileCache) {
		this.fileCache = _fileCache;
		this.onAddrChanged();
	}

	getFileLen() {
		var fcache = this.getFileCache();
		if(!fcache) {
			return 0;
		}
		return fcache.len;
	}

	getFileCache() {
		// return this.fileCache;
		return MainModel.ins.home.fileCache;
	}
}
