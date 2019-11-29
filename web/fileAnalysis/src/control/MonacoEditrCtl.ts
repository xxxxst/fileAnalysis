
import * as monaco from "monaco-editor";
import MonacoAnaLang from 'src/model/MonacoAnaLang';
import MonacoAddrLang from 'src/model/MonacoAddrLang';

import { FileStruct, FileStructAttr } from 'src/model/FileStruct';

export default class MonacoEditrCtl {

	anaModel: monaco.editor.ITextModel = null;
	addrModel: monaco.editor.ITextModel = null;
	editor: monaco.editor.IStandaloneCodeEditor = null;
	
	ele: HTMLDivElement = null;
	mapStruct: Record<string, FileStruct> = {};
	onUpdateText:Function = null;

	fileType = "ana";

	initGlobalMonacoEditor() {
		var defaultLangCount = 61;
		var arrLang = monaco.languages.getLanguages();
		if(arrLang.length > defaultLangCount) {
			return;
		}
		MonacoAnaLang();
		MonacoAddrLang();

		var local = this;
		var arr = ["bit", "char", "byte", "short", "ushort", "int", "uint", "long", "int64", "uint64", "float", "double", "WORD", "DWORD", "BYTE", "LONG"];

		// 智能提示
		monaco.languages.registerCompletionItemProvider("ana", {
			triggerCharacters: [],
			provideCompletionItems(model, position, context, token) {
				var str = model.getLineContent(position.lineNumber).substr(0, position.column-1);
				if(/\s/.test(str)) {
					return { suggestions:[{ label:"", insertText:"", detail: ''}] };
				}

				var arrRst = [];
				for(var i = 0; i < arr.length; ++i) {
					if(arr[i].toLocaleLowerCase().indexOf(str) != 0) {
						continue;
					}
					arrRst.push({ label:arr[i], insertText:arr[i], detail: '' });
				}

				var map = local.mapStruct;
				for(var key in map) {
					var tmp = key.toLocaleLowerCase();
					if(tmp.indexOf(str) != 0) {
						continue;
					}
					arrRst.push({ label:key, insertText:key, detail: '' });
				}

				if(arrRst.length == 0) {
					arrRst.push({ label:"", insertText:"", detail: ''});
				}
				return { suggestions: arrRst };
			},
		} as any);
	}

	init(){
		try {
			// this.monacoModel = monaco.editor.createModel("[IconHeader | 中文]\r\n\r\naddress=\r\n\r\nbyte[3]	Reserved	= 3		;//	保留字段\r\nbyte[3]	Type		= 'bb'	;//	类型", "ana");
			this.anaModel = monaco.editor.createModel("", "ana");
			this.anaModel.updateOptions({ tabSize: 4, insertSpaces: false, });
			this.anaModel.onDidChangeContent(evt=>this.onUpdateText&&this.onUpdateText(evt));

			this.addrModel = monaco.editor.createModel("", "addr");
			this.addrModel.updateOptions({ tabSize: 4, insertSpaces: false, });
			this.addrModel.onDidChangeContent(evt=>this.onUpdateText&&this.onUpdateText(evt));

			// var ele:any = this.$refs.textEdit;
			this.editor = monaco.editor.create(this.ele, {
				model: this.anaModel,
				theme: "vs-dark",
				minimap: { enabled: false },
				lineNumbersMinChars: 3,
				lineDecorationsWidth: 0,
				// automaticLayout: true,
				readOnly: true,
				wordWrap:"off",
				autoClosingBrackets: "never",
				fontFamily: "'simsunspace', 'simsun', Consolas, 'Courier New', monospace",
				// fontFamily: "微软雅黑",
			});

			// var md
			// this.textMd = new TextMd();
			// var smEditor = this.$refs.smEditor as ISimpleMonacoEditor;
			// smEditor.updateOptions({
			// 	model: this.textMd,
			// 	// readOnly: true,
			// 	// fontFamily: "'simsunspace', 'simsun', Consolas, 'Courier New', monospace",
			// 	fontFamily: "'simsun', Consolas, 'Courier New', monospace",
			// });

			// ["bit", "char", "byte", "short", "ushort", "int", "uint", "long", "int64", "uint64", "float", "double"].map(item => {
				
			// });

			// this.editor.onDidChangeModelContent((evt)=>{
			// 	console.info("aaa", evt);
			// });

			// window["aaa"] = this.editor;

			this.resize();
		}catch(ex){
			console.info(ex);
		}
	}

	setFileType(type:string) {
		if(this.fileType == type) {
			return;
		}

		this.fileType = type;

		var md: monaco.editor.ITextModel = null;
		if(type == "ana") {
			md = this.anaModel;
		} else {
			md = this.addrModel;
		}
		md.setValue("");

		this.editor.setModel(md);
	}

	setReadonly(isReadonly:boolean) {
		this.editor.updateOptions({ readOnly: isReadonly });
	}

	getModel() {
		return this.fileType == "ana" ? this.anaModel : this.addrModel;
	}

	getValue() {
		return this.getModel().getValue();
	}

	setValue(str) {
		this.getModel().setValue(str);
	}

	setFileStruct(md:FileStruct) {
		var attrs = md.attrs;

		var colMinLength = this.calcColMinLength(md);

		var str = "";
		var endl = "\r\n";
		str += `[${md.name} | ${md.desc}]` + endl;
		str += endl;
		// if(rootStruct) {
		// 	str += `address=${rootStruct.address}` + endl;
		// 	str += endl;
		// }
		for(var i = 0; i < attrs.length; ++i) {
			var tmp = this.formatRowStr(attrs[i], colMinLength);
			str += tmp + endl;
		}

		// this.originText = str;
		// this.setMonacoTextInner(str);
		this.setValue(str);

		return str;
	}

	resize() {
		if(this.editor == null){
			return;
		}

		setTimeout(()=>{
			this.editor.layout();
		}, 1);
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

	calcColMinLength(md:FileStruct) {
		var rst = [0, 0, 0, 0];
		// if(!md) {
		// 	return;
		// }
		var attrs = md.attrs;
		for(var i = 0; i < attrs.length; ++i) {

			var arr = this.getCols(attrs[i]);
			var arrLen = this.getColLength(arr);

			for(var j = 0; j < arrLen.length; ++j) {
				rst[j] = Math.max(rst[j], arrLen[j]);
			}
		}

		for(var j = 0; j < arrLen.length; ++j) {
			if(rst[j] % 4 == 0) {
				rst[j] += 4;
			}
			rst[j] = Math.ceil(rst[j]/4) * 4;
		}

		// this.colMinLength = rst;
		return rst;
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

	formatRowStr(attr: FileStructAttr, colMinLength) {
		var arr = this.getCols(attr);
		var arrLen = this.getColLength(arr);

		var rst = "";

		for(var i = 0; i < arrLen.length; ++i) {
			// console.info(arr[i]);
			rst += arr[i];
			if(i == arrLen.length - 1) {
				continue;
			}
			if(arrLen[i] < colMinLength[i]) {
				var count = Math.ceil((colMinLength[i] - arrLen[i]) / 4);
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

	// setMonacoTextInner(str) {
	// 	this.changeMonacoTextInner = true;
	// 	this.monacoModel.setValue(str);
	// 	// this.textMd.setValue(str);
	// 	this.changeMonacoTextInner = false;
	// }

}