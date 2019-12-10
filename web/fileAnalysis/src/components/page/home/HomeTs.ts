
//Home
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import axios from 'axios';

import { SState } from 'src/model/MainStore';
import MainModel, { Size } from 'src/model/MainModel';
import EnvMd from 'src/model/EnvMd';
import TimeFormat from 'src/sdk/tsHelp/util/TimeFormat';
import FileCache from 'src/control/FileCache';
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import HexView from 'src/components/util/HexView/HexView.vue';
import IHexView from 'src/components/util/HexView/HexViewTs';
import SimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditor.vue';
import ISimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';
import { TextMd } from 'src/components/util/SimpleMonacoEditor/model/TextMd';
import { FileStructInfo, FileStruct, AddressMd, AddressAttrMd, StructAddressMd, FileStructAttr, StructAddressItem, StructAddressAttr } from 'src/model/FileStruct';
import MonacoEditrCtl from 'src/control/MonacoEditrCtl';
import MapPreview from 'src/components/mapPreview/MapPreview.vue';
import HexViewFill from 'src/components/hexViewFill/HexViewFill.vue';
import IHexViewFill from 'src/components/hexViewFill/HexViewFillTs';
import StructFormatCtl from 'src/control/StructFormatCtl';

@Component({ components: { HexView, HexViewFill, SimpleMonacoEditor, MapPreview }})
export default class Home extends Vue {
	@SState("winSize") winSize: Size;
	@SState("isDebug") isDebug:boolean;
	
	oldOncontextmenu: any = null;

	isInited = false;
	isStaticMode = true;
	isShowStructView = false;
	isEditTree = false;
	isSelectAddress = false;
	hexStartRow = 0;
	confirmDeleteIdx = -1;

	lstFileStruct: FileStructInfo[] = [];
	arrAddress: AddressMd[] = [];
	arrHightlightData = [];

	selectStructInfo: FileStructInfo = null;
	arrSelectStructAddr: StructAddressMd[] = [];
	// selectRootStruct: RootFileStruct = null;
	selectStruct: FileStruct = null;
	viewFileTitle = "";

	// colMinLength = [0, 0, 0, 0];

	originText = "";
	editText = "";
	needSave = false;
	needSaveToServer = false;
	isDoSaveToServer = false;
	// changeMonacoTextInner = false;
	// mapMonacoComplation:Record<string, string> = {};
	mapTypeLen: Record<string, number> = {};
	
	@VIgnore()
	fileCache: FileCache = null;

	@VIgnore()
	monacoEditCtl: MonacoEditrCtl = new MonacoEditrCtl();

	// @VIgnore()
	// textMd: TextMd = null;

	log = "";

	@Watch("winSize")
	onSizeChanged(){
		// var smEditor = this.$refs.smEditor as ISimpleMonacoEditor;
		// if(smEditor) {
		// 	smEditor.layout();
		// }

		this.monacoEditCtl.resize();
		// if(this.editor == null){
		// 	return;
		// }

		// setTimeout(()=>{
		// 	// var ele:any = this.$refs.textEdit;
		// 	// console.info("aaa", $(ele).width(), $(ele).height());
		// 	this.editor.layout();
		// }, 1);
	}

	created() {
		window["log"] = (...args)=>{ this.log = args.join(", "); }

		EnvMd.init();
		
		this.isDebug = !!window["__debug__"];

		this.isStaticMode = (MainModel.ins.static == "1");
		if(this.isDebug) {
			MainModel.ins.serverUrl = "http://localhost:8093/fileAnalysis/server/";
			this.isStaticMode = false;
		}

		this.mapTypeLen = {
			// "bit": 0.125,
			"char": 1,
			"byte": 1,
			"short": 2,
			"ushort": 2,
			"int": 4,
			"uint": 4,
			"long": 4,
			"int64": 8,
			"uint64": 8,
			"float": 4,
			"double": 8,
			"WORD": 2,
			"DWORD": 4,
			"BYTE": 1,
			"LONG": 4,
		};

		MainModel.ins.home = this;

		this.monacoEditCtl.onUpdateText = (e)=>this.onUpdateText(e);
		this.monacoEditCtl.onSave = ()=>this.onRefreshData();
		this.monacoEditCtl.initGlobalMonacoEditor();
		// this.initGlobalMonacoEditor();

		this.loadData();
	}
	
	mounted() {
		this.oldOncontextmenu = document.oncontextmenu;
		document.oncontextmenu = function () { return false; };
		document.ondragover = evt=>evt.preventDefault();
		// document.ondrop = (evt)=>{ this.isDraggingFile = false; evt.preventDefault(); };
		document.addEventListener("keydown", this.anoOnKeydown, { passive: false });
		document.addEventListener("keyup", this.anoOnKeyup, { passive: false });
		document.addEventListener("mousewheel", this.anoOnMousewheel, { passive: false });

		var ele:any = this.$refs.textEdit;
		this.monacoEditCtl.ele = ele;
		this.monacoEditCtl.init();
		// this.initMonacoEditor();

		// var eleFile = this.$refs.fileData as HTMLInputElement;
		// eleFile.addEventListener("change", (e)=>this.onLoadData(e));
		
		// this.$nextTick(()=> {
		// 	this.onSizeChanged();
		// });
		setTimeout(()=> {
			this.onSizeChanged();
		}, 100);
	}

	destroyed() {
		document.oncontextmenu = this.oldOncontextmenu;
		document.removeEventListener("keydown", this.anoOnKeydown);
		document.removeEventListener("keydown", this.anoOnKeyup);
		document.removeEventListener("mousewheel", this.anoOnMousewheel);
	}

	async loadData() {
		if(this.isStaticMode) {
			this.isInited = true;
			return;
		}

		var url = `${MainModel.ins.serverUrl}file/get/1/data/fileStruct.json`;
		try {
			var res = await axios.get(url);
			if(typeof(res.data) == "object") {
				this.formatOriginData(res.data);
				// var rst = [];
				// for(var i = 0; i < res.data.length; ++i) {
				// 	var tmp = new FileStructInfo();
				// 	tmp.name = res.data[i].name;
				// 	tmp.suffix = res.data[i].suffix;
				// 	tmp.address = res.data[i].address;
				// 	tmp.editAddress = res.data[i].address;
				// 	for(var j = 0; j < res.data[i].structs.length; ++j) {
				// 		var struct = res.data[i].structs[j];
				// 		var tmp2 = StructFormatCtl.textToFileStruct(struct.textCache);
				// 		if(tmp2) {
				// 			tmp.structs.push(tmp2);
				// 		}
				// 	}
				// 	rst.push(tmp);
				// }
				// this.lstFileStruct = rst;
			}
			// console.info(rst.data);
		} catch(ex) {}

		this.isInited = true;

		// this.$nextTick(()=> {
		// 	this.onSizeChanged();
		// });
	}

	formatOriginData(data) {
		var rst = [];
		for(var i = 0; i < data.length; ++i) {
			var tmp = new FileStructInfo();
			tmp.name = data[i].name;
			tmp.suffix = data[i].suffix;
			tmp.address = data[i].address;
			tmp.editAddress = data[i].address;
			for(var j = 0; j < data[i].structs.length; ++j) {
				var struct = data[i].structs[j];
				var tmp2 = StructFormatCtl.textToFileStruct(struct.textCache);
				if(tmp2) {
					tmp.structs.push(tmp2);
				}
			}
			rst.push(tmp);
		}
		this.lstFileStruct = rst;
	}

	getSaveData() {
		var data = [];
		for(var i = 0; i < this.lstFileStruct.length; ++i) {
			var it = this.lstFileStruct[i];
			var tmp: any = {};
			tmp.name = it.name;
			tmp.suffix = it.suffix;
			tmp.address = it.address;
			tmp.structs = [];
			for(var j = 0; j < it.structs.length; ++j) {
				var it2 = it.structs[j];
				tmp.structs.push({
					name: it2.name,
					desc: it2.desc,
					textCache: it2.textCache,
				});
			}
			data.push(tmp);
		}
		return data;
	}

	getHexView() {
		return this.$refs.hexView as IHexView;
	}

	anoOnHexViewScroll = (r)=>this.onHexViewScroll(r);
	onHexViewScroll(row) {
		this.hexStartRow = row;
	}

	getHexViewFill() {
		return this.$refs.hexViewFill as IHexViewFill;
	}

	anoOnUpdateFile = (f)=>this.onUpdateFile(f);
	onUpdateFile(fileCache) {
		this.fileCache = fileCache;

		this.getHexViewFill().setFileCache(fileCache);

		if(this.selectStructInfo) {
			this.calcAddress();
		}
	}

	onUpdateText(evt) {
		// if(this.changeMonacoTextInner) {
		// 	return;
		// }
		var str = this.monacoEditCtl.getValue();
		if(this.isSelectAddress && this.selectStructInfo) {
			this.selectStructInfo.editAddress = str;
			this.needSave = true;
			this.needSaveToServer = true;
		}
		if(this.selectStruct) {
			this.selectStruct.editCache = str;
			this.needSave = true;
			this.needSaveToServer = true;
		}
		// var str = this.monacoModel.getValue();
		this.editText = str;

		// if(this.changeMonacoTextInner) {
		// 	return;
		// }

		// if(evt.isRedoing || evt.isUndoing) {
		// 	return;
		// }

		// try {
		// 	var text = evt.changes[0].text;
		// 	if(text != "\t") {
		// 		return;
		// 	}
		// 	var range: monaco.Range = evt.changes[0].range;
		// 	var pos = range.startColumn;
		// 	var line = this.monacoModel.getLineContent(range.startLineNumber);

		// 	if(/^(\[)|(address)/.test(line)) {
		// 		return;
		// 	}
		// 	if(this.checkIsString(line, pos - 1)) {
		// 		return;
		// 	}

		// 	var arr = str.split("\r\n");
		// 	if(range.startLineNumber > arr.length) {
		// 		return;
		// 	}

		// 	var idx = this.calcTextLen(line.substr(0, pos-1) + "\t");
		// 	var newInsert = "\t";
		// 	var totalLen = 0;
		// 	for(var i = 0; i < this.colMinLength.length - 1; ++i) {
		// 		totalLen += this.colMinLength[i];
		// 		if(idx == totalLen) {
		// 			if(pos == line.length) {
		// 				if(i == 1) {
		// 					newInsert += "= ";
		// 				} else if(i == 2) {
		// 					newInsert += ";// ";
		// 				}
		// 			}
		// 			break;
		// 		}

		// 		if(idx < totalLen) {
		// 			var count = Math.ceil((totalLen - idx) / 4);
		// 			if(isNaN(count)) { count = 0; }
		// 			if(count > 200) { count = 200; }
		// 			var tmp = "";
		// 			for(var j = 0; j < count; ++j) {
		// 				tmp += "\t";
		// 			}
		// 			// console.info("aaa", i);
		// 			if(pos == line.length) {
		// 				if(i == 1) {
		// 					tmp += "= ";
		// 				} else if(i == 2) {
		// 					tmp += ";// ";
		// 				}
		// 			}
		// 			// console.info(i, tmp);
		// 			newInsert += tmp;
					
		// 			// console.info("aaa", tmp, "--");
		// 			break;
		// 		}
		// 	}

		// 	var insertRange = new monaco.Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn+1);
		// 	var id = { major: 1, minor: 1 }; 
		// 	var op = {identifier: id, range: insertRange, text: newInsert, forceMoveMarkers: false};
		// 	this.changeMonacoTextInner = true;
		// 	this.editor.executeEdits("", [op]);
		// 	// this.editor.trigger('keyboard', 'type', {text: tmp});
		// 	this.changeMonacoTextInner = false;

		// 	setTimeout(()=>{
		// 		this.editor.setPosition({
		// 			lineNumber:range.startLineNumber, 
		// 			column: pos + newInsert.length
		// 		});
		// 	}, 0);

		// } catch(ex) { }
	}

	// findInsertCol(line, col) {
	// 	var idx = 0;
	// 	var totalLen = 0;
	// 	for(var i = 0; i < this.colMinLength.length; ++i) {
	// 		totalLen += this.colMinLength[i];
	// 		if(col <= totalLen) {

	// 		}
	// 	}
	// }

	anoOnKeydown = evt=>this.onKeydown(evt);
	onKeydown(evt) {
		// prevent ctrl+s event
		if ((evt.ctrlKey === true || evt.metaKey) && evt.keyCode==83) {
			evt.preventDefault();
		}
	}

	anoOnKeyup = evt=>this.onKeyup(evt);
	onKeyup(evt) {
		// console.info(evt);
	}

	anoOnMousewheel = (e)=>this.onMousewheel(e);
	onMousewheel(evt) {
		if ((evt.ctrlKey === true || evt.metaKey)) {
			evt.preventDefault();
		}
	}

	onClickParser(it:FileStructInfo) {
		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
		
		this.selectStructInfo = it;
		// this.arrSelectStructAddr = it.structs;
		var arr = [];
		for(var i = 0; i < it.structs.length; ++i) {
			var tmp = new StructAddressMd();
			tmp.data = it.structs[i];
			arr.push(tmp);
		}
		this.arrSelectStructAddr = arr;

		var map = {};
		for(var key in this.selectStructInfo.structs) {
			var md = this.selectStructInfo.structs[key];
			map[md.name] = md;
		}
		this.monacoEditCtl.mapStruct = map;
		// this.mapStruct = map;

		// calc struct length
		for(var i = 0; i < it.structs.length; ++i) {
			var name = it.structs[i].name;
			it.structs[i].len = this.calcStructLen(name);
		}

		this.formatAddress();
	}

	formatAddress() {
		var md = this.selectStructInfo;
		if(!md) {
			return;
		}

		this.arrAddress = StructFormatCtl.textToAddress(md.editAddress);

		// var rst = [];
		// var arr = md.address.replace(/\r\n/g, "\n").split("\n");
		// for(var i = 0; i < arr.length; ++i) {
		// 	var idx = arr[i].indexOf("	");
		// 	if(idx < 0) {
		// 		continue;
		// 	}
		// 	var tmp = new AddressMd();
		// 	tmp.name = arr[i].substr(0, idx);
		// 	tmp.address = arr[i].substr(idx+1);

		// 	rst.push(tmp);
		// }

		// this.arrAddress = rst;

		if(this.fileCache) {
			this.calcAddress();
		}
	}

	calcStructLen(name, outAttrLen:Array<number>=null, deep=0) {
		if(deep > 10) {
			return 0;
		}
		var map = this.monacoEditCtl.mapStruct;
		if(!(name in map)) {
			return 0;
		}

		var len = 0;
		var arr = map[name].attrs;
		for(var i = 0; i < arr.length; ++i) {
			var type = arr[i].type;
			if(type in this.mapTypeLen) {
				var tmp = this.mapTypeLen[type];
				if(arr[i].arrayLength >= 0) {
					tmp = tmp * arr[i].arrayLength;
				}
				outAttrLen && outAttrLen.push(tmp);
				len += tmp;
				continue;
			}

			if(!(type in map)) {
				outAttrLen && (outAttrLen.splice(0, outAttrLen.length));
				len = 0;
				break;
			}

			var tmp = this.calcStructLen(type, null, deep+1);
			if(arr[i].arrayLength >= 0) {
				tmp = tmp * arr[i].arrayLength;
			}
			outAttrLen && outAttrLen.push(tmp);
			len += tmp;
		}

		return len;
	}

	getAttrLen(attr:FileStructAttr) {
		var map = this.monacoEditCtl.mapStruct;

		var type = attr.type;
		if(type in this.mapTypeLen) {
			var len = this.mapTypeLen[type];
			if(attr.arrayLength >= 0) {
				len = len * attr.arrayLength;
			}
			return len;
		}

		if(!(type in map)) {
			return 0;
		}

		var len = this.calcStructLen(type);
		if(attr.arrayLength >= 0) {
			len = len * attr.arrayLength;
		}
		return len;
	}

	calcAddress() {
		var map = this.monacoEditCtl.mapStruct;
		for(var i = 0; i < this.arrAddress.length; ++i) {
			var md = this.arrAddress[i];
			md.realAddr = -1;
			if(!(md.name in map)) {
				continue;
			}

			try {
				md.realAddr = eval(md.address);
			} catch(ex) {
				md.realAddr = -1;
			}
			var arr = [];
			var attrs = [];
			md.len = this.calcStructLen(md.name, arr);
			// md.len = map[md.name].len;
			var pos = md.realAddr;
			for(var j = 0; j < arr.length; ++j) {
				var tmp = new AddressAttrMd();
				tmp.address = pos;
				tmp.len = arr[j];
				attrs.push(tmp);
				pos += arr[j];
			}
			md.attrs = attrs;
		}

		this.updateAttrValue();
	}

	async updateAttrValue() {
		var mapCacheRst: Record<string, Array<StructAddressItem>> = {};
		var mapStructAddr: Record<string, StructAddressMd> = {};
		for(var i = 0; i < this.arrSelectStructAddr.length; ++i) {
			var it = this.arrSelectStructAddr[i];
			mapStructAddr[it.data.name] = it;
			// it.arrItem = [];
			mapCacheRst[it.data.name] = [];
		}

		// var map = this.monacoEditCtl.mapStruct;
		
		for(var i = 0; i < this.arrAddress.length; ++i) {
			var md = this.arrAddress[i];
			if(!(md.name in mapStructAddr)) {
				continue;
			}

			if(md.realAddr < 0) {
				continue;
			}
			
			var md2 = new StructAddressItem();
			md2.address = md.realAddr;
			md2.addrIdx = i;

			var data = mapStructAddr[md.name].data;
			var pos = md.realAddr;
			for(var j = 0; j < data.attrs.length; ++j) {
				var it2 = data.attrs[j];
				var len = this.getAttrLen(it2);
				var val = await this.getAttrValue(pos, it2);

				var tmp = new StructAddressAttr();
				tmp.address = pos;
				tmp.idx = j;
				tmp.addrIdx = i;
				tmp.values = val;
				md2.attrData.push(tmp);
				pos += len;
			}
			mapCacheRst[md.name].push(md2);
			// mapStructAddr[md.name].arrItem.push(md2);
		}

		for(var key in mapCacheRst) {
			mapStructAddr[key].arrItem = mapCacheRst[key];
		}
	}

	async getAttrValue(address:number, attr:FileStructAttr, maxLoadArrayCount = 10): Promise<any[]> {
		if(!this.fileCache) {
			return [];
		}

		var type = attr.type;
		if(!(type in this.mapTypeLen)) {
			return [];
		}

		if(attr.arrayLength == 0) {
			return [];
		}

		var len = this.mapTypeLen[type];
		var totalLen = len;
		var count = 1;
		if(attr.arrayLength >= 0) {
			count = attr.arrayLength > maxLoadArrayCount ? maxLoadArrayCount : attr.arrayLength;
			totalLen = len * count;
		}

		var arr = await this.fileCache.getArray(address, totalLen);
		if(arr.length < totalLen) {
			return [];
		}
		var pos = 0;
		var rst = [];
		for(var i = 0; i < count; ++i) {
			var tmp = 0;
			switch(type) {
				case "char": {
					tmp = arr[pos];
					if((arr[pos] & 0x80) != 0) {
						tmp = -(0xff + ~tmp) - 2;
					}
					break;
				}
				case "byte":
				case "BYTE": tmp = arr[pos]; break;
				case "short": {
					tmp = ((arr[pos+1] << 8) + arr[pos]);
					if((arr[pos+1] & 0x80) != 0) {
						tmp = -(0xffff + ~tmp) - 2;
					}
					break;
				}
				case "ushort":
				case "WORD": tmp = ((arr[pos+1] << 8) + arr[pos]); break;
				case "int":
				case "long":
				case "LONG": {
					tmp = ((arr[pos+3] << 24) + (arr[pos+2] << 16) + (arr[pos+1] << 8) + arr[pos]);
					if((arr[pos+3] & 0x80) != 0) {
						tmp = -(0xffffffff + ~tmp) - 2;
					}
					break;
				}
				case "uint":
				case "DWORD":tmp = ((arr[pos+3] << 24) + (arr[pos+2] << 16) + (arr[pos+1] << 8) + arr[pos]); break;
				case "int64": {
					tmp = ((arr[pos+7] << 56) + (arr[pos+6] << 48) + (arr[pos+5] << 40) + (arr[pos+4] << 32) + (arr[pos+3] << 24) + (arr[pos+2] << 16) + (arr[pos+1] << 8) + arr[pos]); break;
					if((arr[pos+7] & 0x80) != 0) {
						tmp = -(0xffffffffffffffff + ~tmp) - 2;
					}
					break;
				}
				case "uint64": tmp = ((arr[pos+7] << 56) + (arr[pos+6] << 48) + (arr[pos+5] << 40) + (arr[pos+4] << 32) + (arr[pos+3] << 24) + (arr[pos+2] << 16) + (arr[pos+1] << 8) + arr[pos]); break;
				case "float":
				case "double":
				default: break;
			}
			rst.push(tmp);
			pos += len;
		}

		return rst;
	}

	onClickBack() {
		this.viewFileTitle = "";
		this.selectStructInfo = null;
		this.arrSelectStructAddr = [];
		// this.selectRootStruct = null;
		this.selectStruct = null;
		this.isSelectAddress = false;
		this.monacoEditCtl.mapStruct = {};
		this.monacoEditCtl.editor.updateOptions({ readOnly: true });
		this.monacoEditCtl.setValue("");
		this.arrAddress = [];
		// this.mapStruct = {};
		// // this.monacoModel.setValue("");
		// this.editor.updateOptions({ readOnly: true });
		// this.setMonacoTextInner("");
		this.originText = "";
		// this.colMinLength = [0, 0, 0, 0];

		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
	}

	onClickAddParser() {
		this.isEditTree = true;
		this.confirmDeleteIdx = -1;
		this.needSaveToServer = true;

		var md = new FileStructInfo();
		md.name = ".ico";
		var idx = this.lstFileStruct.length;
		this.lstFileStruct.push(md);

		this.$nextTick(()=>{
			var ele = this.$refs["muParserInput_" + idx] as any;
			// console.info(ele);
			if(ele && ele[0]) {
				ele = ele[0];
			}
			if(ele) {
				ele.focus();
			}
		});
	}

	onClickAddStruct() {
		if(!this.selectStructInfo) {
			return;
		}

		this.needSave = true;
		this.needSaveToServer = true;

		var strTemplate = "[Struct | ]\r\n\r\nbyte\tkey;// desc\r\n";
		var md = StructFormatCtl.textToFileStruct(strTemplate);
		md.textCache = "";
		this.selectStructInfo.structs.push(md);

		// var tmp = new StructAddressMd();
		// tmp.data = md;
		// this.arrSelectStructAddr.push(tmp);

		this.onClickStruct(md);
	}

	// onClickShowHideStructView() {
	// 	this.isShowStructView = !this.isShowStructView;
	// 	// this.selectRootStruct = null;
	// 	this.selectStruct = null;
	// 	// this.monacoModel.setValue("");
	// 	this.monacoEditCtl.editor.updateOptions({ readOnly: true });
	// 	this.monacoEditCtl.setValue("");
	// 	// this.editor.updateOptions({ readOnly: true });
	// 	// this.setMonacoTextInner("");
	// 	this.originText = "";
	// 	// this.colMinLength = [0, 0, 0, 0];
	// }

	// onClickRootStruct(it:RootFileStruct) {
	// 	var map = this.monacoEditCtl.mapStruct;
	// 	if(!(it.name in map)) {
	// 		return;
	// 	}

	// 	this.selectRootStruct = it;
	// 	this.selectStruct = map[it.name];
	// 	this.selectStructName = this.selectStruct.name;
	// 	this.monacoEditCtl.setReadonly(false);
	// 	// this.editor.updateOptions({ readOnly: false });

	// 	this.updateText();
	// }

	onClickStruct(it:FileStruct) {
		this.selectStruct = null;
		this.isSelectAddress = false;

		this.monacoEditCtl.setReadonly(false);
		this.monacoEditCtl.setFileType("ana");

		this.monacoEditCtl.setValue(it.editCache);
		this.viewFileTitle = it.name;
		this.selectStruct = it;
		this.originText = it.textCache;

		this.isEditTree = false;
		this.confirmDeleteIdx = -1;

		// this.updateText();
	}

	updateText() {
		if(!this.selectStruct) {
			return;
		}
		var md = this.selectStruct;
		// this.originText = this.monacoEditCtl.setFileStruct(md);
		this.originText = md.textCache;
		this.monacoEditCtl.setValue(md.editCache);

		// var attrs = this.selectStruct.attrs;

		// this.calcColMinLength();

		// var str = "";
		// var endl = "\r\n";
		// str += `[${md.name} | ${md.desc}]` + endl;
		// str += endl;
		// if(this.selectRootStruct) {
		// 	str += `address=${this.selectRootStruct.address}` + endl;
		// 	str += endl;
		// }
		// for(var i = 0; i < attrs.length; ++i) {
		// 	var tmp = this.formatRowStr(attrs[i]);
		// 	str += tmp + endl;
		// }

		// this.originText = str;
		// this.setMonacoTextInner(str);
	}

	onClickAddressBtn() {
		if(!this.selectStructInfo) {
			return;
		}
		this.isSelectAddress = false;
		this.selectStruct = null;
		this.monacoEditCtl.setReadonly(false);
		this.monacoEditCtl.setFileType("addr");
		this.monacoEditCtl.setValue(this.selectStructInfo.editAddress);

		this.isSelectAddress = true;
		this.viewFileTitle = "Address";
		
		// this.monacoEditCtl.setValue(this.selectStructInfo.address);
		this.originText = this.selectStructInfo.address;
	}

	// setEditorInner(text) {
	// 	this.changeMonacoTextInner = true;
	// 	this.monacoEditCtl.setValue(text);
	// 	this.changeMonacoTextInner = false;
	// }

	onRefreshData() {
		// if(!this.selectStructInfo) {
		// 	return;
		// }
		if(!this.needSave) {
			return;
		}
		this.needSave = false;
		// if(this.isDoSaveToServer) {
		// 	return;
		// }
		// this.needSave = false;
		// if(this.selectStructInfo.address != this.selectStructInfo.editAddress) {
		// 	this.selectStructInfo.address = this.selectStructInfo.editAddress;
		// 	if(this.isSelectAddress) {
		// 		this.originText = this.selectStructInfo.address;
		// 	}
		// }
		for(var i = 0; i < this.lstFileStruct.length; ++i) {
			var md = this.lstFileStruct[i];
			md.address = md.editAddress;
			if(md == this.selectStructInfo) {
				// md.address = md.editAddress;
				if(this.isSelectAddress) {
					this.originText = md.address;
				}
			}
			for(var j = 0; j < md.structs.length; ++j) {
				var it = md.structs[j];
				if(it.editCache == it.textCache) {
					continue;
				}
				it.textCache = it.editCache;
				var tmp = StructFormatCtl.textToFileStruct(it.textCache);
				if(!tmp) {
					continue;
				}
				md.structs[j] = tmp;
				if(this.selectStruct == it) {
					this.selectStruct = tmp;
					this.viewFileTitle = tmp.name;
					this.originText = tmp.textCache;
					// delete this.monacoEditCtl.mapStruct[it.name];
					// this.monacoEditCtl.mapStruct[tmp.name] = tmp;
					// this.onClickStruct(tmp);
				}
			}
		}
		this.onClickParser(this.selectStructInfo);
		// this.formatAddress();

		// this.saveToServer();
	}

	onLoadData(evt) {
		var ele = this.$refs.fileData as HTMLInputElement;
		var file = ele.files && ele.files[0];
		if(!file) {
			return;
		}

		this.loadDataFromLocal(file);
	}

	loadDataFromLocal(file) {
		var local = this;

		var reader = new FileReader();
		reader.onloadend = function(evt2) {
			var rst = evt2.target.result as any;
			try{
				var obj = JSON.parse(rst);
				local.formatOriginData(obj);
			}catch(ex) {}
		}
		reader.readAsText(file);
	}

	onDownloadData() {
		if(this.isStaticMode) {
			this.needSaveToServer = false;
		}
		
		this.onRefreshData();
	
		var data = this.getSaveData();
		var blob = new Blob([JSON.stringify(data)]);
		var ele = document.createElement('a');
		ele.download = "fileStruct.json";
		ele.href = URL.createObjectURL(blob);;
		document.body.appendChild(ele);
		ele.click();
		document.body.appendChild(ele);
	}

	onSaveToServer() {
		if(this.isDoSaveToServer) {
			return;
		}

		if(!this.needSaveToServer) {
			return;
		}
		this.needSaveToServer = false;

		this.onRefreshData();

		this.saveToServer();
	}

	async saveToServer() {
		// var data = [];
		// for(var i = 0; i < this.lstFileStruct.length; ++i) {
		// 	var it = this.lstFileStruct[i];
		// 	var tmp: any = {};
		// 	tmp.name = it.name;
		// 	tmp.suffix = it.suffix;
		// 	tmp.address = it.address;
		// 	tmp.structs = [];
		// 	for(var j = 0; j < it.structs.length; ++j) {
		// 		var it2 = it.structs[j];
		// 		tmp.structs.push({
		// 			name: it2.name,
		// 			desc: it2.desc,
		// 			textCache: it2.textCache,
		// 		});
		// 	}
		// 	data.push(tmp);
		// }
		var data = this.getSaveData();

		// save to server
		this.isDoSaveToServer = true;
		var url = `${MainModel.ins.serverUrl}file/saveString`;
		var md = {
			path: "data/fileStruct.json",
			rewrite: "",
			rename: 0,
			data: JSON.stringify(data)
		};
		try {
			var rst = await axios.post(url, md);
		}catch(ex) { }
		
		this.isDoSaveToServer = false;
	}

	anoOnHightlightChanged = (d)=>this.onHightlightChanged(d);
	onHightlightChanged(hlData) {
		this.arrHightlightData = hlData;
	}

	onChangeParserName() {
		this.needSaveToServer = true;
	}

	onEnterParserName() {
		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
	}

	onClickMenuEdit() {
		this.isEditTree=!this.isEditTree;
		this.confirmDeleteIdx = -1;
	}

	onClickMenuItemDelete(idx) {
		if(idx == this.confirmDeleteIdx) {
			this.confirmDeleteIdx = -1;
			return;
		}
		this.confirmDeleteIdx = idx;
	}
	
	onClickMenuItemDeleteSure() {
		if(this.confirmDeleteIdx < 0) {
			return;
		}
		if(!this.selectStructInfo) {
			// remove parser
			this.lstFileStruct.splice(this.confirmDeleteIdx, 1);
		} else {
			// remove struct
			if(this.selectStruct == this.selectStructInfo[this.confirmDeleteIdx]) {
				this.selectStruct = null;
				this.viewFileTitle = "";
				this.monacoEditCtl.editor.updateOptions({ readOnly: true });
				this.monacoEditCtl.setValue("");
				this.originText = "";
				this.editText = "";
			}
			// var name = this.selectStructInfo.structs[this.confirmDeleteIdx].name;
			this.selectStructInfo.structs.splice(this.confirmDeleteIdx, 1);
			// this.arrSelectStructAddr.splice(this.confirmDeleteIdx, 1);
			// for(var i = this.arrAddress.length - 1; i >= 0; --i) {
			// 	if(this.arrAddress[i].name == name) {
			// 		this.arrAddress.splice(i, 1);
			// 	}
			// }
			// // this.arrAddress = StructFormatCtl.textToAddress(this.selectStructInfo.editAddress);
			// delete this.monacoEditCtl.mapStruct[this.selectStruct.name];
		}
		this.needSaveToServer = true;
		this.confirmDeleteIdx = -1;
	}

}
