
//HexViewFill
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

import { VIgnore } from '@/sdk/tsHelp/vue/VIgnore';
import { AddressMd } from '@/model/FileStruct';
import FileCache from '@/control/FileCache';
import MainModel from '@/model/MainModel';

class RenderRoot {
	md: AddressMd = null;
	attrs: RenderItem[] = [];
}

class RenderItem {
	highlight = false;
	path = "";
}

@Comp({})
export default class HexViewFill extends Vue {
	@Prop() arrAddress: AddressMd[] = [];
	@Prop() arrHightlightData: any[] = [];
	@Prop() hexStartRow: number = 0;

	renderData: RenderRoot[] = [];
	renderOverData: RenderItem[] = [];
	mapRenderData: Record<number, RenderRoot> = {};

	renderDataRight: RenderRoot[] = [];
	renderOverDataRight: RenderItem[] = [];
	mapRenderDataRight: Record<number, RenderRoot> = {};

	@VIgnore()
	fileCache: FileCache = null;

	@Watch({ name: "arrAddress", immediate: true, deep: true })
	@Watch({ name: "hexStartRow" })
	onAddrChanged() {
		// var fcache = this.getFileCache();
		// if(fcache == null) {
		// 	return;
		// }
		var fileLen = this.getFileLen();
		if (fileLen <= 0) {
			this.renderData = [];
			this.renderOverData = [];
			this.mapRenderData = {};
			
			this.renderDataRight = [];
			this.renderOverDataRight = [];
			this.mapRenderDataRight = {};
			return;
		}

		var arr = this.updateRenderData(25, 18);
		this.mapRenderData = arr[0];
		this.renderData = arr[1];

		var arr2 = this.updateRenderData(8.4, 18);
		this.mapRenderDataRight = arr2[0];
		this.renderDataRight = arr2[1];

		this.arrHightlightDataChanged();

		// var endRow = Math.floor(fileLen / 16) - 1;
		// if (this.hexStartRow + 15 < endRow) {
		// 	endRow = this.hexStartRow + 15;
		// }

		// var w = 25;
		// var h = 18;

		// var rst = [];
		// var map: Record<number, RenderRoot> = {};
		// for (var i = 0; i < this.arrAddress.length; ++i) {
		// 	var startRoot = this.arrAddress[i].realAddr;
		// 	var lenRoot = this.arrAddress[i].len;
		// 	var r1Root = Math.floor(startRoot / 16);
		// 	var r2Root = Math.floor((startRoot + lenRoot - 1) / 16);
		// 	if (r1Root > endRow || r2Root < this.hexStartRow) {
		// 		continue;
		// 	}

		// 	var pos = 0;

		// 	var root = new RenderRoot();
		// 	rst.push(root);
		// 	map[i] = root;

		// 	for (var j = 0; j < this.arrAddress[i].attrs.length; ++j) {
		// 		var attr = this.arrAddress[i].attrs[j];

		// 		var start = this.arrAddress[i].realAddr + pos;
		// 		var len = attr.len;
		// 		pos += len;
		// 		var r1 = Math.floor(start / 16);
		// 		var r2 = Math.floor((start + len - 1) / 16);
		// 		if (r1 > endRow || r2 < this.hexStartRow) {
		// 			continue;
		// 		}

		// 		var c1 = start - r1 * 16;
		// 		var c2 = (start + len - 1) - r2 * 16;

		// 		var r1 = r1 - this.hexStartRow;
		// 		var r2 = r2 - this.hexStartRow;

		// 		var x1 = c1 * w + 3;
		// 		var y1 = r1 * h;
		// 		var x2 = (c2 + 1) * w + 3;
		// 		var y2 = (r2 + 1) * h - 3;

		// 		var md = new RenderItem();
		// 		root.attrs.push(md);

		// 		var str = "";
		// 		if (r1 == r2) {
		// 			str += `${x1},${y1} ${x2},${y1} ${x2},${y2}, ${x1},${y2} ${x1},${y1}`;
		// 			md.path = str;
		// 			continue;
		// 		}

		// 		var x3 = 16 * w + 3;
		// 		var y3 = y2 - (h - 3);
		// 		var x4 = 3;
		// 		var y4 = y1 + (h - 3);

		// 		str += `${x1},${y1} ${x3},${y1} ${x3},${y3}, ${x2},${y3} ${x2},${y2} ${x4},${y2} ${x4},${y4} ${x1},${y4} ${x1},${y1}`;
		// 		md.path = str;
		// 	}

		// }
		// // console.info(rst);
		// this.mapRenderData = map;
		// this.renderData = rst;

		// this.arrHightlightDataChanged();
	}

	updateRenderData(w, h): any[] {
		var fileLen = this.getFileLen();
		if (fileLen <= 0) {
			return [];
		}

		var endRow = Math.floor(fileLen / 16) - 1;
		if (this.hexStartRow + 15 < endRow) {
			endRow = this.hexStartRow + 15;
		}

		// var w = 25;
		// var h = 18;

		var rst = [];
		var map: Record<number, RenderRoot> = {};
		for (var i = 0; i < this.arrAddress.length; ++i) {
			var startRoot = this.arrAddress[i].realAddr;
			var lenRoot = this.arrAddress[i].len;
			var r1Root = Math.floor(startRoot / 16);
			var r2Root = Math.floor((startRoot + lenRoot - 1) / 16);
			if (r1Root > endRow || r2Root < this.hexStartRow) {
				continue;
			}

			var pos = 0;

			var root = new RenderRoot();
			rst.push(root);
			map[i] = root;

			for (var j = 0; j < this.arrAddress[i].attrs.length; ++j) {
				var attr = this.arrAddress[i].attrs[j];

				var start = this.arrAddress[i].realAddr + pos;
				var len = attr.len;
				pos += len;
				var r1 = Math.floor(start / 16);
				var r2 = Math.floor((start + len - 1) / 16);
				if (r1 > endRow || r2 < this.hexStartRow) {
					continue;
				}

				var c1 = start - r1 * 16;
				var c2 = (start + len - 1) - r2 * 16;

				var r1 = r1 - this.hexStartRow;
				var r2 = r2 - this.hexStartRow;

				var x1 = Math.round(c1 * w + 3);
				var y1 = Math.round(r1 * h);
				var x2 = Math.round((c2 + 1) * w + 3);
				var y2 = Math.round((r2 + 1) * h - 3);

				var md = new RenderItem();
				root.attrs.push(md);

				var str = "";
				if (r1 == r2) {
					str += `${x1},${y1} ${x2},${y1} ${x2},${y2}, ${x1},${y2} ${x1},${y1}`;
					md.path = str;
					continue;
				}

				var x3 = 16 * w + 3;
				var y3 = y2 - (h - 3);
				var x4 = 3;
				var y4 = y1 + (h - 3);

				str += `${x1},${y1} ${x3},${y1} ${x3},${y3}, ${x2},${y3} ${x2},${y2} ${x4},${y2} ${x4},${y4} ${x1},${y4} ${x1},${y1}`;
				md.path = str;
			}

		}
		// console.info(rst);
		// this.mapRenderData = map;
		// this.renderData = rst;

		return [map, rst];

		// this.arrHightlightDataChanged();
	}

	@Watch(IMMEDIATE | DEEP)
	arrHightlightDataChanged() {
		var map = this.mapRenderData;
		var mapRight = this.mapRenderDataRight;
		var hlRst = [];
		var hlRstRight = [];

		for (var i = 0; i < this.arrHightlightData.length; ++i) {
			var it = this.arrHightlightData[i];
			if (!(it[0] in map)) {
				continue;
			}

			var attrs = map[it[0]].attrs;
			var attrsRight = mapRight[it[0]].attrs;
			if (it[1] >= attrs.length) {
				continue;
			}

			hlRst.push(attrs[it[1]]);
			hlRstRight.push(attrsRight[it[1]]);
		}

		// console.info(test, map);
		this.renderOverData = hlRst;
		this.renderOverDataRight = hlRstRight;
	}

	created() {

	}

	mounted() {

	}

	destroyed() {

	}

	setFileCache(_fileCache) {
		this.fileCache = _fileCache;
		this.onAddrChanged();
	}

	getFileLen() {
		var fcache = this.getFileCache();
		if (!fcache) {
			return 0;
		}
		return fcache.len;
	}

	getFileCache() {
		// return this.fileCache;
		return MainModel.ins.home.fileCache;
	}
}
