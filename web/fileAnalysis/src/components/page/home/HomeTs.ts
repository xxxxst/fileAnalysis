
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
import ComUtil from 'src/util/ComUtil';
import MonacoHelpCtl from 'src/control/MonacoHelpCtl';

@Component({ components: { HexView, HexViewFill, SimpleMonacoEditor, MapPreview }})
export default class Home extends Vue {
	@SState("winSize") winSize: Size;
	@SState("isDebug") isDebug:boolean;
	
	oldOncontextmenu: any = null;
	oldWindowBeforeunload:any = null;

	isInited = false;
	isStaticMode = true;
	isShowStructView = false;
	isEditTree = false;
	isShowHelp = false;
	isSelectAddress = false;
	hexStartRow = 0;
	confirmDeleteIdx = -1;

	lstFileStruct: FileStructInfo[] = [];
	arrAddress: AddressMd[] = [];
	arrHightlightData = [];

	selectStructInfo: FileStructInfo = null;
	arrSelectStructAddr: StructAddressMd[] = [];
	selectStruct: FileStruct = null;
	viewFileTitle = "";

	originText = "";
	editText = "";
	needSave = false;
	needSaveToServer = false;
	isDoSaveToServer = false;
	mapTypeLen: Record<string, number> = {};
	
	@VIgnore()
	fileCache: FileCache = null;

	@VIgnore()
	monacoEditCtl: MonacoEditrCtl = new MonacoEditrCtl();

	@VIgnore()
	monacoHelpCtl: MonacoHelpCtl = new MonacoHelpCtl();

	isDragMenu = false;
	dragIdx = -1;
	dragItemText = "";
	dragPointerStyle = {
		top: "0px"
	};
	dragNewIdx = -1;

	log = "";

	@Watch("winSize")
	onSizeChanged(){
		this.monacoEditCtl.resize();
		this.monacoHelpCtl.resize();
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

		this.loadData();
	}
	
	mounted() {
		this.oldOncontextmenu = document.oncontextmenu;
		this.oldWindowBeforeunload = window.onbeforeunload;
		window.onbeforeunload = (e)=>this.onClosing(e);
		window.addEventListener("dragover", this.anoOnDragover, false);
		window.addEventListener("drag", this.onDrag, false);
		document.oncontextmenu = function () { return false; };
		document.ondragover = evt=>evt.preventDefault();
		// document.ondrop = (evt)=>{ this.isDraggingFile = false; evt.preventDefault(); };
		document.addEventListener("keydown", this.anoOnKeydown, { passive: false });
		document.addEventListener("keyup", this.anoOnKeyup, { passive: false });
		document.addEventListener("mousewheel", this.anoOnMousewheel, { passive: false });
		// document.addEventListener("mousemove", this.anoOnDocumentMousemove, { passive: false });
		document.addEventListener("mouseup", this.anoOnDocumentMouseup, { passive: false });
		
		var ele:any = this.$refs.textEdit;
		this.monacoEditCtl.ele = ele;
		this.monacoEditCtl.init();

		this.monacoHelpCtl.ele = this.$refs.textHelp as any;
		this.monacoHelpCtl.init();

		ComUtil.waitElementLoaded(this.$refs.textEdit).then(()=> {
			this.onSizeChanged();
		});
	}

	initHelpView() {

	}

	destroyed() {
		document.oncontextmenu = this.oldOncontextmenu;
		window.onbeforeunload = this.oldWindowBeforeunload;
		document.removeEventListener("keydown", this.anoOnKeydown);
		document.removeEventListener("keydown", this.anoOnKeyup);
		document.removeEventListener("mousewheel", this.anoOnMousewheel);
		// document.removeEventListener("mousemove", this.anoOnDocumentMousemove);
		document.removeEventListener("mouseup", this.anoOnDocumentMouseup);
		window.removeEventListener("dragover", this.anoOnDragover, false);
		window.removeEventListener("drag", this.onDrag, false);
	}

	onClosing(evt) {
		if(this.isDebug) {
			return;
		}
		if(!this.needSaveToServer) {
			return;
		}

		evt.returnValue=("sure to leave");
	}

	anoOnDragover = (e) =>this.onDragover(e);
	onDragover(evt) {
		evt.preventDefault();
	}

	anoOnDrag = (e) =>this.onDrag(e);
	onDrag(evt) {
		evt.preventDefault();
	}

	loadDefaultData() {
		try {
			var obj = JSON.parse(MainModel.ins.defaultData);
			if(typeof(obj) == "object") {
				this.formatOriginData(obj);
			}
		} catch (ex) { }
	}

	async loadData() {
		if(this.isStaticMode) {
			this.loadDefaultData();
			this.isInited = true;
			return;
		}

		var url = `${MainModel.ins.serverUrl}file/get/1/data/fileStruct.json`;
		try {
			var res = await axios.get(url);
			if(typeof(res.data) == "object") {
				this.formatOriginData(res.data);
			}
		} catch(ex) {
			this.isStaticMode = true;
			this.loadDefaultData();
		}

		this.isInited = true;
		
		this.$nextTick(()=>{
			this.onSizeChanged();
		});
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

		this.unselectParser();

		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
		this.needSave = false;
		if(this.isStaticMode) {
			this.needSaveToServer = false;
		}
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
		this.editText = str;
	}

	anoOnKeydown = evt=>this.onKeydown(evt);
	onKeydown(evt:KeyboardEvent) {
		// prevent ctrl+s event
		if ((evt.ctrlKey === true || evt.metaKey) && evt.keyCode==83) {
			evt.preventDefault();
		}

		// esc && drag menu item
		if(evt.keyCode == 27 && this.isDragMenu) {
			this.isDragMenu = false;
			this.dragIdx = -1;
			this.dragNewIdx = -1;
		}

		// ctrl + s
		if(evt.ctrlKey && evt.keyCode == 83) {
			this.onRefreshData();
		}
	}

	anoOnKeyup = evt=>this.onKeyup(evt);
	onKeyup(evt) {

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

	unselectParser() {
		this.unselectAddress();
		this.unselectStruct();

		this.arrSelectStructAddr = [];
		this.monacoEditCtl.mapStruct = {};
		this.arrAddress = [];
		this.selectStructInfo = null;
	}

	unselectAddress() {
		if(!this.isSelectAddress) {
			return;
		}
		this.viewFileTitle = "";
		this.isSelectAddress = false;
		this.monacoEditCtl.editor.updateOptions({ readOnly: true });
		this.monacoEditCtl.setValue("");
		this.originText = this.editText = "";
	}

	unselectStruct() {
		if(!this.selectStruct) {
			return;
		}
		this.viewFileTitle = "";
		this.selectStruct = null;
		this.monacoEditCtl.editor.updateOptions({ readOnly: true });
		this.monacoEditCtl.setValue("");
		this.originText = this.editText = "";
	}

	onClickBack() {
		this.unselectParser();

		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
	}

	onClickAddParser() {
		this.isEditTree = true;
		this.confirmDeleteIdx = -1;
		this.needSave = true;
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

		this.onClickStruct(md);
	}

	onClickStruct(it:FileStruct) {
		if(this.isEditTree) {
			return;
		}
		if(this.isShowHelp) {
			this.monacoHelpCtl.setType("ana");
		}

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
	}

	updateText() {
		if(!this.selectStruct) {
			return;
		}
		var md = this.selectStruct;
		this.originText = md.textCache;
		this.monacoEditCtl.setValue(md.editCache);
	}

	onClickAddressBtn() {
		if(!this.selectStructInfo) {
			return;
		}
		if(this.isShowHelp) {
			this.monacoHelpCtl.setType("addr");
		}

		this.isSelectAddress = false;
		this.selectStruct = null;
		this.monacoEditCtl.setReadonly(false);
		this.monacoEditCtl.setFileType("addr");
		this.monacoEditCtl.setValue(this.selectStructInfo.editAddress);

		this.isSelectAddress = true;
		this.viewFileTitle = "Address";
		
		this.originText = this.selectStructInfo.address;
	}

	onRefreshData() {
		if(!this.needSave) {
			return;
		}
		this.needSave = false;
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
				}
			}
		}
		if(this.selectStructInfo) {
			this.onClickParser(this.selectStructInfo);
		}
	}

	onLoadData(evt) {
		var ele = this.$refs.fileData as HTMLInputElement;
		var file = ele.files && ele.files[0];
		if(!file) {
			return;
		}
		ele.value = "";

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
		this.needSave = true;
		this.needSaveToServer = true;
	}

	onEnterParserName() {
		this.isEditTree = false;
		this.confirmDeleteIdx = -1;
	}

	onClickMenuEdit() {
		this.unselectStruct();
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
			this.selectStructInfo.structs.splice(this.confirmDeleteIdx, 1);
		}
		this.needSave = true;
		this.needSaveToServer = true;
		this.confirmDeleteIdx = -1;
	}

	onDowmMenuItemDrag(idx, evt) {
		if(!this.isEditTree) {
			return;
		}
		if(this.isDragMenu) {
			return;
		}
		this.isDragMenu = true;
		// this.dragDownY = evt.pageY;
		this.dragIdx = idx;
		this.dragNewIdx = idx;

		if(!this.selectStructInfo) {
			this.dragItemText = this.lstFileStruct[idx].name;
		} else {
			this.dragItemText = this.selectStructInfo.structs[idx].name;
		}
	}

	onMousemoveMenuItem(idx, evt) {
		if(!this.isDragMenu) {
			return;
		}

		// var eleBox: HTMLDivElement = null;
		var itemHeight = 36;
		if(this.selectStructInfo) {
			itemHeight = 24;
		}

		var pos = ComUtil.getTargetMousePos(evt);
		var newIdx = idx;
		if(pos.y >= itemHeight/2) {
			newIdx = idx + 1;
		}
		this.dragNewIdx = newIdx;
		this.dragPointerStyle.top = newIdx * itemHeight + "px";
	}

	listReInsert(lst:any[], idx, newIdx) {
		if(idx == newIdx || idx == newIdx-1) {
			return;
		}

		var tmp = lst[idx];
		lst.splice(idx, 1);

		if (idx < newIdx) {
			lst.splice(newIdx - 1, 0, tmp);
		} else {
			lst.splice(newIdx, 0, tmp);
		}
	}

	anoOnDocumentMouseup = (e)=>this.onDocumentMouseup(e);
	onDocumentMouseup(evt) {
		if(!this.isDragMenu) {
			return;
		}

		var idx = this.dragIdx;
		var newIdx = this.dragNewIdx;

		this.isDragMenu = false;
		this.dragIdx = -1;
		this.dragNewIdx = -1;

		if(idx == newIdx || idx == (newIdx-1) || idx < 0 || newIdx < 0) {
			return;
		}
		if(idx == newIdx || idx == newIdx-1) {
			return;
		}

		if(!this.selectStructInfo) {
			this.listReInsert(this.lstFileStruct, idx, newIdx);
		} else {
			this.listReInsert(this.selectStructInfo.structs, idx, newIdx);
			this.listReInsert(this.arrSelectStructAddr, idx, newIdx);
		}
		this.needSave = true;
		this.needSaveToServer = true;

	}

	onClickHelp() {
		this.isShowHelp = !this.isShowHelp;

		this.$nextTick(()=>{
			this.monacoEditCtl.resize();
			this.monacoHelpCtl.resize();
		});

		if(!this.isShowHelp) {
			return;
		}

		if(this.isSelectAddress) {
			this.monacoHelpCtl.setType("addr");
		} else {
			this.monacoHelpCtl.setType("ana");
		}
	}

}
