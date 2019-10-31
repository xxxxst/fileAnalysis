
//Home
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import axios from 'axios';

import * as monaco from "monaco-editor";

import { SState } from 'src/model/MainStore';
import MainModel, { Size } from 'src/model/MainModel';
import EnvMd from 'src/model/EnvMd';
import TimeFormat from 'src/sdk/tsHelp/util/TimeFormat';
import FileCache from 'src/control/FileCache';
import MonacoStructLang from 'src/model/MonacoStructLang';
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import HexView from 'src/components/util/HexView/HexView.vue';
import SimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditor.vue';
import ISimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';
import { TextMd } from 'src/components/util/SimpleMonacoEditor/model/TextMd';

class FileStructAttr {
	name = "";
	desc = "";
	type = "";
	arrayLength = -1;
	defaultValue = "";
}

class FileStruct {
	name = "";
	desc = "";
	// address = "";
	textCache = "";
	attrs: FileStructAttr[] = [];

	_editTextCache = "";
	_saved = true;
}

class RootFileStruct {
	name = "";
	address = "";

	// target: FileStruct = null;
}

class FileStructInfo {
	name = "";
	suffix = "";
	// lstData: FileStruct[] = [];
	routes: RootFileStruct[] = [];
	structs: FileStruct[] = [];
}

@Component({ components: { HexView, SimpleMonacoEditor }})
export default class Home extends Vue {
	@SState("winSize") winSize: Size;
	@SState("isDebug") isDebug:boolean;
	
	oldOncontextmenu: any = null;

	isInited = false;
	isShowStructView = false;

	lstFileStruct: FileStructInfo[] = [];
	mapStruct: Record<string, FileStruct> = {};

	selectStructInfo: FileStructInfo = null;
	selectRootStruct: RootFileStruct = null;
	selectStruct: FileStruct = null;

	colMinLength = [0, 0, 0, 0];

	originText = "";
	editText = "";
	changeMonacoTextInner = false;
	// mapMonacoComplation:Record<string, string> = {};

	@VIgnore()
	monacoModel: monaco.editor.ITextModel = null;

	@VIgnore()
	editor: monaco.editor.IStandaloneCodeEditor = null;

	@VIgnore()
	textMd: TextMd = null;

	@Watch("winSize")
	onSizeChanged(){
		var smEditor = this.$refs.smEditor as ISimpleMonacoEditor;
		if(smEditor) {
			smEditor.layout();
		}

		if(this.editor == null){
			return;
		}

		setTimeout(()=>{
			// var ele:any = this.$refs.textEdit;
			// console.info("aaa", $(ele).width(), $(ele).height());
			this.editor.layout();
		}, 1);
	}

	created() {
		EnvMd.init();
		
		this.isDebug = !!window["__debug__"];

		if(this.isDebug) {
			MainModel.ins.serverUrl = "http://localhost:8093/fileAnalysis/server/";
		}

		this.initGlobalMonacoEditor();

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

		this.initMonacoEditor();
	}

	destroyed() {
		document.oncontextmenu = this.oldOncontextmenu;
		document.removeEventListener("keydown", this.anoOnKeydown);
		document.removeEventListener("keydown", this.anoOnKeyup);
		document.removeEventListener("mousewheel", this.anoOnMousewheel);
	}

	async loadData() {
		var url = `${MainModel.ins.serverUrl}file/get/1/data/fileStruct.json`;
		try {
			var rst = await axios.get(url);
			if(typeof(rst.data) == "object") {
				// var arr: FileStructInfo[] = rst.data;
				// for(var i = 0; i < arr.length; ++i) {
				// 	for(var j = 0; j < arr[i].structs.length; ++j) {
				// 		arr[i].structs[j].
				// 	}
				// }
				this.lstFileStruct = rst.data;
			}
			// console.info(rst.data);
		} catch(ex) {}

		this.isInited = true;

		this.$nextTick(()=> {
			this.onSizeChanged();
		});
	}

	initGlobalMonacoEditor() {
		MonacoStructLang();

		var local = this;
		var arr = ["bit", "char", "byte", "short", "ushort", "int", "uint", "long", "int64", "uint64", "float", "double"];

		// 智能提示
		monaco.languages.registerCompletionItemProvider("ana", {
			triggerCharacters: [],
			provideCompletionItems(model, position, context, token) {
				var str = model.getLineContent(position.lineNumber).substr(0, position.column-1);
				if(/\s/.test(str)) {
					return { suggestions:[] };
				}

				var arrRst = [];
				for(var i = 0; i < arr.length; ++i) {
					if(arr[i].indexOf(str) != 0) {
						continue;
					}
					arrRst.push({ label:arr[i], insertText:arr[i], detail: '' });
				}
				var map = local.mapStruct;
				// console.info(map);
				for(var key in map) {
					var tmp = key.toLocaleLowerCase();
					if(tmp.indexOf(str) != 0) {
						continue;
					}
					arrRst.push({ label:key, insertText:key, detail: '' });
				}
				// console.info(arrRst);

				return { suggestions: arrRst };

				// console.info(position, context, token);
				// return { suggestions:[{
				// 	label: 'aaa',
				// 	// kind: monaco.languages.CompletionItemKind['Function'],
				// 	insertText: 'aaa',
				// 	// detail: ''
				// }]};
			},
		} as any);
	}

	initMonacoEditor(){
		try {
			// this.monacoModel = monaco.editor.createModel("[IconHeader | 中文]\r\n\r\naddress=\r\n\r\nbyte[3]	Reserved	= 3		;//	保留字段\r\nbyte[3]	Type		= 'bb'	;//	类型", "ana");
			this.monacoModel = monaco.editor.createModel("", "ana");
			this.monacoModel.updateOptions({
				tabSize: 4,
				insertSpaces: false,
			});

			this.monacoModel.onDidChangeContent(evt=>this.onUpdateText(evt));

			var ele:any = this.$refs.textEdit;
			this.editor = monaco.editor.create(ele, {
				model: this.monacoModel,
				theme: "vs-dark",
				minimap: { enabled: false },
				lineNumbersMinChars: 3,
				lineDecorationsWidth: 0,
				// automaticLayout: true,
				// readOnly: true,
				wordWrap:"off",
				autoClosingBrackets: "never",
				fontFamily: "'simsunspace', 'simsun', Consolas, 'Courier New', monospace",
				// fontFamily: "微软雅黑",
			});

			// var md
			this.textMd = new TextMd();
			var smEditor = this.$refs.smEditor as ISimpleMonacoEditor;
			smEditor.updateOptions({
				model: this.textMd,
				// readOnly: true,
				// fontFamily: "'simsunspace', 'simsun', Consolas, 'Courier New', monospace",
				fontFamily: "'simsun', Consolas, 'Courier New', monospace",
			});

			// ["bit", "char", "byte", "short", "ushort", "int", "uint", "long", "int64", "uint64", "float", "double"].map(item => {
				
			// });

			// this.editor.onDidChangeModelContent((evt)=>{
			// 	console.info("aaa", evt);
			// });

			// window["aaa"] = this.editor;

			this.onSizeChanged();
		}catch(ex){
			console.info(ex);
		}
	}

	checkIsString(str, pos) {
		var strTag = "";
		var isESC = false;
		var count = Math.min(str.length - 1, pos);
		for(var i = 0; i <= count; ++i) {
			var ch = str.charAt(i);
			if(ch == "\\") {
				isESC = true;
				continue;
			}
			if(isESC) {
				isESC = false;
				continue;
			}
			if(!this.isStringTag(ch)) {
				continue;
			}
			if(strTag == "") {
				strTag = ch;
				continue;
			}
			if(strTag != ch) {
				continue;
			}
			strTag = "";
		}

		return strTag != "";
	}

	isStringTag(ch) {
		return (ch =="\"" || ch == "'" || ch == "`");
	}

	findStringEnd(str, pos) {
		var startCh = str.charAt(pos);
		if(this.isStringTag(startCh)) {
			return - 1;
		}

		var strTag = startCh;
		var isESC = false;
		// var count = Math.min(str.length - 1, pos);
		for(var i = pos + 1; i < str.length; ++i) {
			var ch = str.charAt(i);
			if(ch == "\\") {
				isESC = true;
				continue;
			}
			if(isESC) {
				isESC = false;
				continue;
			}
			if(!this.isStringTag(ch)) {
				continue;
			}
			if(strTag == "") {
				strTag = ch;
				continue;
			}
			if(strTag != ch) {
				continue;
			}
			return i;
		}

		return str.length - 1;
	}

	splitToCols(str) {
		var rst = ["", "", "", ""];

		var tmp = /^[a-zA-Z0-9_]+(\[[\s]*[0-9]+[\s]*\])?[\s]*/.exec(str);
		if(!tmp) { return rst; }
		rst[0] = tmp[0];

		str = str.substr(tmp[0].length);
		tmp = /^[a-zA-Z0-9_]+[\s]*/.exec(str);
		if(!tmp) { return rst; }
		rst[1] = tmp[1];

		str = str.substr(tmp[0].length);
		tmp = /^[a-zA-Z0-9_ =]+[\t]*/.exec(str);
		if(!tmp) { return rst; }
		rst[2] = tmp[2];

		rst[3] = str.substr(tmp[0].length);

		return rst;
	}

	onUpdateText(evt) {
		var str = this.monacoModel.getValue();
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

	fhtml(str) {
		if(typeof(str) != "string") {
			return str;
		}
		// console.info("111", str);

		str = str.replace(/[&]/g, "&&");
		str = str.replace(/["]/g, "&quot;");
		str = str.replace(/[ ]/g, "&nbsp;");
		str = str.replace(/[<]/g, "&lt;");
		str = str.replace(/[>]/g, "&gt;");
		str = str.replace(/&&/g, "&amp;");
		// console.info("222", str);
		return str;
	}

	onClickFormat(it) {
		this.selectStructInfo = it;

		var map = {};
		for(var key in this.selectStructInfo.structs) {
			var md = this.selectStructInfo.structs[key];
			map[md.name] = md;
		}
		this.mapStruct = map;
	}

	onClickBack() {
		this.selectStructInfo = null;
		this.selectRootStruct = null;
		this.selectStruct = null;
		this.mapStruct = {};
		// this.monacoModel.setValue("");
		this.editor.updateOptions({ readOnly: true });
		this.setMonacoTextInner("");
		this.originText = "";
		this.colMinLength = [0, 0, 0, 0];
	}

	onClickAddFormat() {
		
	}

	onClickShowHideStructView() {
		this.isShowStructView = !this.isShowStructView;
		this.selectRootStruct = null;
		this.selectStruct = null;
		// this.monacoModel.setValue("");
		this.editor.updateOptions({ readOnly: true });
		this.setMonacoTextInner("");
		this.originText = "";
		this.colMinLength = [0, 0, 0, 0];
	}

	onClickRootStruct(it:RootFileStruct) {
		if(!(it.name in this.mapStruct)) {
			return;
		}

		this.selectRootStruct = it;
		this.selectStruct = this.mapStruct[it.name];
		this.editor.updateOptions({ readOnly: false });

		this.updateText();
	}

	onClickStruct(it:FileStruct) {
		this.selectStruct = it;
		this.editor.updateOptions({ readOnly: false });

		this.updateText();
	}

	calcColMinLength() {
		var rst = [0, 0, 0, 0];
		if(!this.selectStruct) {
			return;
		}
		// var md = this.selectStruct;
		var attrs = this.selectStruct.attrs;
		// var arr = ["", "", "", ""];
		for(var i = 0; i < attrs.length; ++i) {
			// arr[0] = attrs[i].type;
			// if(attrs[i].arrayLength >= 0) {
			// 	arr[0] += `[${attrs[i].arrayLength}]`;
			// }
			// arr[1] = attrs[i].name;
			// arr[2] = attrs[i].defaultValue;
			// arr[3] = attrs[i].desc;

			var arr = this.getCols(attrs[i]);
			var arrLen = this.getColLength(arr);

			for(var j = 0; j < arrLen.length; ++j) {
				// arr[j] = arr[j].replace(/\t/g, "    ");
				// arr[j] = arr[j].replace(/[^\u0000-\u00FF]/g, "  ");
				// rst[j] = Math.max(rst[j], arr[j].length);
				rst[j] = Math.max(rst[j], arrLen[j]);
			}

			// rst[0] = Math.max(rst[0], str0.length);
			// rst[1] = Math.max(rst[1], str1.length);
			// rst[2] = Math.max(rst[2], str2.length);
			// rst[3] = Math.max(rst[3], str3.length);
		}

		for(var j = 0; j < arrLen.length; ++j) {
			if(rst[j] % 4 == 0) {
				rst[j] += 4;
			}
			rst[j] = Math.ceil(rst[j]/4) * 4;
		}

		// rst[0] = Math.ceil(rst[0]/4) * 4;
		// rst[1] = Math.ceil(rst[1]/4) * 4;
		// rst[2] = Math.ceil(rst[2]/4) * 4;
		// rst[3] = Math.ceil(rst[3]/4) * 4;

		this.colMinLength = rst;
	}

	calcTextLen(str) {
		str = str.replace(/[^\u0000-\u00FF]/g, "  ");
		var len = 0;
		for(var j = 0; j < str.length; ++j) {
			if(str.charAt(j) != '\t') {
				len += 1;
				continue;
			}
			len += 4-(len%4);
		}

		return len;
	}

	getColLength(arr:string[]) {
		var rst = [0, 0, 0, 0];
		var tmp = arr.slice(0, arr.length);
		for(var i = 0; i < arr.length; ++i) {
			// tmp[i] = tmp[i].replace(/[^\u0000-\u00FF]/g, "  ");
			// var len = 0;
			// for(var j = 0; j < tmp[i].length; ++j) {
			// 	if(tmp[i].charAt(j) != '\t') {
			// 		len += 1;
			// 		continue;
			// 	}
			// 	len += 4-(len%4);
			// }
			var len = this.calcTextLen(tmp[i]);
			rst[i] = len;
		}
		return rst;
	}

	getCols(attr: FileStructAttr) {
		var arr = ["", "", "", ""];

		arr[0] = attr.type;
		if(attr.arrayLength >= 0) {
			arr[0] += `[${attr.arrayLength}]`;
		}
		// arr[0] += "";
		arr[1] = attr.name + "";
		arr[2] = "= " + attr.defaultValue + "";
		// if(attr.defaultValue != "") {
		// }
		arr[3] = ";// " + attr.desc;

		return arr;
	}

	formatRowStr(attr: FileStructAttr) {
		var arr = this.getCols(attr);
		var arrLen = this.getColLength(arr);

		var rst = "";

		for(var i = 0; i < arrLen.length; ++i) {
			// console.info(arr[i]);
			rst += arr[i];
			if(i == arrLen.length - 1) {
				continue;
			}
			if(arrLen[i] < this.colMinLength[i]) {
				var count = Math.ceil((this.colMinLength[i] - arrLen[i]) / 4);
				// console.info("aaa", count, arrLen, this.colMinLength);
				if(isNaN(count)) { count = 0; }
				if(count > 200) { count = 200; }
				var tmp = "";
				for(var j = 0; j < count; ++j) {
					tmp += "\t";
				}
				rst += tmp;
			}
		}

		return rst;
	}

	setMonacoTextInner(str) {
		this.changeMonacoTextInner = true;
		this.monacoModel.setValue(str);
		this.textMd.setValue(str);
		this.changeMonacoTextInner = false;
	}

	updateText() {
		if(!this.selectStruct) {
			return;
		}
		var md = this.selectStruct;
		var attrs = this.selectStruct.attrs;

		this.calcColMinLength();

		var str = "";
		var endl = "\r\n";
		str += `[${md.name} | ${md.desc}]` + endl;
		str += endl;
		if(this.selectRootStruct) {
			str += `address=${this.selectRootStruct.address}` + endl;
			str += endl;
		}
		for(var i = 0; i < attrs.length; ++i) {
			// var tmp = attrs[i].type;
			// if(attrs[i].arrayLength >= 0) {
			// 	tmp += `[${attrs[i].arrayLength}]`;
			// }
			// tmp += "\t";
			// str += `${attrs[i].type}` + endl;

			var tmp = this.formatRowStr(attrs[i]);
			str += tmp + endl;
		}
		// console.info(str);

		this.originText = str;
		// this.editText = str;
		// this.monacoModel.setValue(str);
		this.setMonacoTextInner(str);
	}

};
