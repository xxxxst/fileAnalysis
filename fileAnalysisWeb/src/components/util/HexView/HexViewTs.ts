
//HexView
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

import axios from 'axios';

import FileCache from '@/control/FileCache';
import HexViewScrollbar from '@/components/util/HexView/view/hexViewScrollbar/HexViewScrollbar.vue';
import IHexViewScrollbar, { HexViewScrollbarMd } from '@/components/util/HexView/view/hexViewScrollbar/HexViewScrollbarTs';
import VEvent from '@/sdk/tsHelp/vue/VEvent';
import { EventType } from '@/model/MainModel';

@Comp({ HexViewScrollbar })
export default class HexView extends Vue {
	@Prop() onUpdateFile: Function = null;
	@Prop() onScroll: Function = null;

	// oldOncontextmenu: any = null;

	isWaitFile = true;
	isDraggingFile = false;
	isOverDragFileBox = false;
	strJump = "";

	showRows = 16;
	lstData = [];
	lstHexHead = [];
	lstAddr = [];
	lstHexData = [];
	lstHexText = [];

	totalRow = 0;
	showStartRow = 0;

	file = null;
	fileCache: FileCache = null;

	slbMd: HexViewScrollbarMd = new HexViewScrollbarMd();

	slbChangedTimeId = -1;
	slbNewValue = 0;

	isDoUpdateAddr = false;
	lastUpdateAddrOpt: { row, refresh } = null;

	created() {
		var arr = [];
		for (var i = 0; i < 16; ++i) {
			var str = " " + i.toString(16).toLocaleUpperCase();
			str = this.fhtml(str);
			var width = "25px";
			if (i == 0) {
				width = "28px";
			} else if (i == 15) {
				width = "29px";
			}
			arr.push({ desc: str, width: width, class: "right" });
		}
		this.lstHexHead = arr;

		this.slbMd.onChanging = (pos) => this.onSlbChanged(pos);
		this.slbMd.contentSize = 25;
		this.updateAddr(0, true);
		// this.updateAddr(0);
	}

	getFill(ch: string, size: number) {
		var rst = "";
		for (var i = 0; i < size; ++i) {
			rst += ch;
		}
		return rst;
	}

	getHex(val: number, fill: string) {
		var str = fill + val.toString(16).toLocaleUpperCase();
		return str.substring(str.length - fill.length);
	}

	mounted() {
		// this.oldOncontextmenu = document.oncontextmenu;
		// document.oncontextmenu = function () { return false; };
		// document.ondragover = evt=>evt.preventDefault();
		document.ondrop = (evt) => { this.isDraggingFile = false; evt.preventDefault(); };
		// document.addEventListener("mousewheel", this.anoOnMousewheel, { passive: false });

		var ele = this.$refs.dragFileBox as HTMLDivElement;
		ele.ondragover = (evt) => {
			this.isDraggingFile = true;
			evt.preventDefault();
		};
		ele.ondragleave = (evt) => {
			this.isDraggingFile = false;
		};
		ele.ondrop = (evt) => {
			this.isDraggingFile = false;
			var lst = evt.dataTransfer.files;
			if (lst.length <= 0) {
				return;
			}

			this.isWaitFile = false;
			this.file = lst[0];
			// console.info(lst);

			this.fileCache && this.fileCache.clear();
			this.fileCache = new FileCache();
			this.fileCache.setFile(this.file);

			this.updateTotalRow();
			this.slbMd.position = 0;
			this.updateAddr(0, true);

			this.onUpdateFile && this.onUpdateFile(this.fileCache);

		};
	}

	onSlbChanged(pos) {
		this.slbNewValue = pos;
		if (this.slbChangedTimeId >= 0) {
			return;
		}
		this.slbChangedTimeId = setTimeout(() => this.onSlbChangedNext(), 50);
		document.onmousewheel = null;
	}

	onSlbChangedNext() {
		this.slbChangedTimeId = -1;
		var val = Math.round(this.slbNewValue);
		// console.info(this.slbNewValue);
		this.updateAddr(val);
	}

	updateTotalRow() {
		var fileSize = this.getFileSize();
		var colCount = 16;
		var count = Math.ceil(fileSize / colCount);
		// console.info(totaRow, totaRow.toString(16));
		this.totalRow = count;
		this.slbMd.count = count - 1;
	}

	getFileSize() {
		return this.file ? this.file.size : 0;
	}

	async updateAddr(row, refresh = false) {
		// if(!this.file) {
		// 	return;
		// }

		if (this.isDoUpdateAddr) {
			this.lastUpdateAddrOpt = { row: 0, refresh: false };
			return;
		}

		if (!this.fileCache) {
			this.lstHexData = [];
			this.lstAddr = [];
			this.lstHexText = [];
			this.showStartRow = 0;
			this.onScroll && this.onScroll(0);
			return;
		}

		if (row > this.totalRow) {
			row = this.totalRow - 1;
		}
		if (row < 0) {
			row = 0;
		}

		if (!refresh && this.showStartRow == row) {
			return;
		}

		this.onScroll && this.onScroll(row);

		this.isDoUpdateAddr = true;
		this.showStartRow = row;
		var start = row * 16;

		// start = Math.floor(start / 16) * 16;
		var fsize = this.getFileSize();

		var readCount = 16 * 16;
		if (start + readCount >= fsize) {
			readCount = fsize - start;
			if (readCount < 0) {
				readCount = 0;
			}
		}

		// this.getFileData(start, readCount);
		if (this.fileCache) {
			var ch = await this.fileCache.getch(0);
		}

		var space = "&nbsp;";
		var space2 = space + space;

		var arrAddr = [];
		var arr = [];
		var arrHexText = [];
		var fill = this.getFill("0", 8);
		for (var i = 0; i < this.showRows; ++i) {
			var tmp = [];
			var rowStart = start + i * 16;
			if (rowStart >= fsize && i != 0) {
				break;
			}
			// head
			// tmp.push(this.getHex(start + i * 16, fill));
			arrAddr.push(this.getHex(start + i * 16, fill));

			// data
			var text = "";
			for (var j = 0; j < 16; ++j) {
				var idx = rowStart + j;
				if (idx >= fsize) {
					tmp.push(space2);
					text += " ";
				} else {
					var ch = await this.fileCache.getch(idx);
					tmp.push(this.getHex(ch, "00"));

					switch(ch) {
						case 0: text += " "; break;
						case 0xF0:
						case 0x89:
						case 0x0D:
						case 0x0A: {
							text += ".";
							break;
						}
						default: text += String.fromCharCode(ch); break;
					}

					// if (ch == 0) {
					// 	text += " ";
					// } else {
					// 	text += String.fromCharCode(ch);
					// }
				}
			}

			// text
			// tmp.push(text);
			text = this.fhtml(text);
			arrHexText.push(text);

			arr.push(tmp);
		}
		// this.lstAddr = arr;
		this.lstHexData = arr;
		this.lstAddr = arrAddr;
		this.lstHexText = arrHexText;

		this.isDoUpdateAddr = false;
		if (this.lastUpdateAddrOpt != null) {
			var opt = this.lastUpdateAddrOpt;
			this.lastUpdateAddrOpt = null;
			this.updateAddr(opt.row, opt.refresh);
		}
	}

	destroyed() {
		this.onUpdateFile && this.onUpdateFile(null);
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
		if (typeof (str) != "string") {
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

	getVerScrollbar() {
		return this.$refs.slbVer as IHexViewScrollbar;
	}

	onMousewheel(evt: MouseWheelEvent) {
		if (!this.fileCache) {
			return;
		}

		var gap = 6;
		var newVal = 0;
		var slb = this.getVerScrollbar();
		if (evt.wheelDelta <= 0) {
			newVal = this.showStartRow + gap;
		} else {
			newVal = this.showStartRow - gap;
		}
		slb.setValue(newVal);
		// this.updateAddr(newVal);
	}

	onKeydown(evt) {
		// console.info(evt);
		var slb = this.getVerScrollbar();

		var keyCode = evt.keyCode;
		if (keyCode == 40) {
			// arrow down
			slb.setValue(this.showStartRow + 1);
		} else if (keyCode == 38) {
			// arrow up
			slb.setValue(this.showStartRow - 1);
		}
	}

	jumpHex(num: number) {
		var colCount = 16;
		var row = Math.floor(num / colCount);

		var slb = this.getVerScrollbar();
		slb.setValue(row);
	}

	onClickJump() {
		var num = parseInt("0x" + this.strJump);
		this.strJump = "";
		if (isNaN(num)) {
			return;
		}
		this.jumpHex(num);
	}

	@VEvent(EventType.jumpHex)
	onJumpHex(num) {
		this.jumpHex(num);
	}
}
