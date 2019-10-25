
//HexView
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import axios from 'axios';

import FileCache from 'src/control/FileCache';

@Component({ components: { }})
export default class HexView extends Vue {
	
	// oldOncontextmenu: any = null;

	isWaitFile = true;
	isDraggingFile = false;
	isOverDragFileBox = false;

	showRows = 16;
	lstData = [];
	lstHexHead = [];
	lstAddr = [];
	lstHexData = [];
	lstHexText = [];

	file = null;
	fileCache: FileCache = null;

	created() {
		var arr = [];
		for(var i = 0 ; i < 16; ++i) {
			var str = " " + i.toString(16).toLocaleUpperCase();
			var width = "24px";
			if(i == 15) {
				width = "28px";
			}
			arr.push({desc:str, width:width, class:"right"});
		}
		this.lstHexHead = arr;

		this.updateAddr(0);
	}

	getFill(ch:string, size:number){
		var rst = "";
		for(var i = 0; i < size; ++i){
			rst += ch;
		}
		return rst;
	}

	getHex(val:number, fill:string) {
		var str = fill + val.toString(16).toLocaleUpperCase();
		return str.substring(str.length - fill.length);
	}
	
	mounted() {
		// this.oldOncontextmenu = document.oncontextmenu;
		// document.oncontextmenu = function () { return false; };
		// document.ondragover = evt=>evt.preventDefault();
		document.ondrop = (evt)=>{ this.isDraggingFile = false; evt.preventDefault(); };
		// document.addEventListener("mousewheel", this.anoOnMousewheel, { passive: false });

		var ele = this.$refs.dragFileBox as HTMLDivElement;
		ele.ondragover = (evt)=>{
			this.isDraggingFile = true;
			evt.preventDefault();
		};
		ele.ondragleave = (evt)=>{
			this.isDraggingFile = false;
		};
		ele.ondrop = (evt)=>{
			this.isDraggingFile = false;
			var lst = evt.dataTransfer.files;
			if(lst.length <= 0){
				return;
			}

			this.isWaitFile = false;
			this.file = lst[0];
			// console.info(lst);

			this.fileCache && this.fileCache.clear();
			this.fileCache = new FileCache();
			this.fileCache.setFile(this.file);

			this.updateAddr(0);
		};
	}

	getFileSize() {
		return this.file ? this.file.size : 0;
	}

	async updateAddr(start) {
		// if(!this.file) {
		// 	return;
		// }
		
		start = Math.floor(start / 16) * 16;
		var fsize = this.getFileSize();

		var readCount = 16*16;
		if(start + readCount >= fsize) {
			readCount = fsize - start;
			if(readCount < 0) {
				readCount = 0;
			}
		}

		// this.getFileData(start, readCount);
		if(this.fileCache) {
			var ch = await this.fileCache.getch(0);
		}

		var arrAddr = [];
		var arr = [];
		var arrHexText = [];
		var fill = this.getFill("0", 8);
		for(var i = 0; i < this.showRows; ++i) {
			var tmp = [];
			var rowStart = start + i * 16;
			if(rowStart >= fsize && i != 0) {
				break;
			}
			// head
			// tmp.push(this.getHex(start + i * 16, fill));
			arrAddr.push(this.getHex(start + i * 16, fill));

			// data
			var text = "";
			for(var j = 0; j < 16; ++j) {
				var idx = rowStart + j;
				if(idx >= fsize) {
					tmp.push("");
					text += " ";
				} else {
					var ch = await this.fileCache.getch(idx);
					tmp.push(this.getHex(ch, "00"));

					if(ch == 0) {
						text += " ";
					} else {
						text += String.fromCharCode(ch);
					}
				}
			}

			// text
			// tmp.push(text);
			arrHexText.push(text);

			arr.push(tmp);
		}
		// this.lstAddr = arr;
		this.lstHexData = arr;
		this.lstAddr = arrAddr;
		this.lstHexText = arrHexText;
	}

	destroyed() {
		// document.oncontextmenu = this.oldOncontextmenu;
		// document.removeEventListener("mousewheel", this.anoOnMousewheel);
	}

	// anoOnMousewheel = (e)=>this.onMousewheel(e);
	// onMousewheel(evt) {
	// 	if (evt.ctrlKey === true || evt.metaKey) {
	// 		evt.preventDefault();
	// 	}
	// }

	loadFile() {

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

};
