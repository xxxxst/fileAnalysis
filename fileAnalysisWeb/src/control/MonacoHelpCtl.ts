
import * as monaco from "monaco-editor";

export default class MonacoHelpCtl {
	anaModel: monaco.editor.ITextModel = null;
	addrModel: monaco.editor.ITextModel = null;
	editor: monaco.editor.IStandaloneCodeEditor = null;
	
	ele: HTMLDivElement = null;
	fileType = "ana";

	init() {
		try {
			this.anaModel = monaco.editor.createModel(this.getStructValue(), "ana");
			this.anaModel.updateOptions({ tabSize: 4, insertSpaces: false, });

			this.addrModel = monaco.editor.createModel(this.getAddrValue(), "addr");
			this.addrModel.updateOptions({ tabSize: 4, insertSpaces: false, });

			this.editor = monaco.editor.create(this.ele, {
				model: this.anaModel,
				theme: "vs-dark",
				minimap: { enabled: false },
				lineNumbersMinChars: 3,
				lineDecorationsWidth: 0,
				readOnly: true,
				wordWrap:"off",
				autoClosingBrackets: "never",
				renderIndentGuides: false,
				fontFamily: "'simsunspace', 'simsun', Consolas, 'Courier New', monospace",
			});

			this.resize();
		}catch(ex){
			console.info(ex);
		}
	}

	getAddrValue() {
		var str = "";
		var end = "\r\n";
		str += "// Address format";
		str += end + "// " + "----------" + "----------" + "----------";
		str += end + "StructName address1(eval value)";
		str += end + "StructName address2(eval value)";
		str += end + "...";
		str += end + "// " + "----------" + "----------" + "----------";
		str += end + "// StructName	: latter,number,$,_";
		str += end + "// address		: compile to => eval(address)";
		str += end + "";
		str += end + "// embed vars:";
		str += end + "// $next: pre struct end address";
		str += end + "// StructName[index].attr: attr of struct name, index is index of pre decode struct";
		str += end + "// StructName[index].$base: start address of target struct";
		str += end + "// StructName[index].$next: next address of target struct";
		str += end + "// " + "----------" + "----------" + "----------";

		str += end + "//";
		str += end + "//		||  example";
		str += end + "//		\\/";
		str += end + "";

		str += end + "Header	0x0";
		str += end + "Header	$next+Header[0].$base+Header[0].$next+Header[0].attrName+0x2+3";
		return str;
	}

	getStructValue() {
		var str = "";
		var end = "\r\n";
		str += "// Struct format";
		str += end + "// " + "----------" + "----------" + "----------";
		str += end + "[StructName | Desc]";
		str += end + "";
		str += end + "Type			key1	= value	;// desc";
		str += end + "Type[length]	key2			;// desc";
		str += end + "...";
		str += end + "// " + "----------" + "----------" + "----------";
		str += end + "// StructName	: latter,number,$,_";
		str += end + "// Type			: char,byte,short,unshort,int,uint,long,int64,uint64,float,double,WORD,DWORD,BYTE,LONG, or array";
		str += end + "// key			: latter,number,$,_";
		str += end + "// " + "----------" + "----------" + "----------";
		
		str += end + "//";
		str += end + "//		||  example";
		str += end + "//		\\/";
		str += end + "";

		str += end + "[Header | Desc]";
		str += end + "";
		str += end + "byte[2]	type	= 0	;// file type";
		str += end + "int		width		;// image width";
		str += end + "...";
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

	setType(type:string) {
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
		this.editor.setModel(md);
	}
}