
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import Scrollbar from 'src/components/util/SimpleMonacoEditor/Scrollbar/Scrollbar.vue';
import IScrollbar, { ScrollbarMd } from 'src/components/util/SimpleMonacoEditor/Scrollbar/ScrollbarTs';
import LineNumberBox from 'src/components/util/SimpleMonacoEditor/LineNumberBox/LineNumberBox.vue';
import { LineNumberMd } from 'src/components/util/SimpleMonacoEditor/LineNumberBox/LineNumberBoxTs';
import { version } from 'punycode';
import { EditorOption } from 'src/components/util/SimpleMonacoEditor/model/EditorOption';
import { TextLine, TextItem } from 'src/components/util/SimpleMonacoEditor/model/TextLine';

class SelectMaskStyle {
	pos = 0;
	style = new class {
		left = "0";
		// top = "0";
		width = "0";
	}
}

class SelectLineItem {
	row = 0;
	pos = 0;
	length = 0;
	style = new class {
		top = "0";
		height = "19px";
	};
	data: SelectMaskStyle[] = [];
}

declare var log:(...args)=>null;

@Component({ components: { Scrollbar, LineNumberBox } })
export default class SimpleMonacoEditor extends Vue {
	lines: TextLine[] = [new TextLine()];

	isMouseOver = false;
	isFocus = false;

	@VIgnore()
	option = new EditorOption();

	verSlbMd = new ScrollbarMd();
	horSlbMd = new ScrollbarMd();
	lineNoMd = new LineNumberMd();

	textInput = "";
	lastTextareaPaste = "";

	rootStyle = new class {
		fontSize = "14px";
		fontFamily = "'simsun', Consolas, 'Courier New', monospace";
	};

	lineStyle = new class {
		height = "19px";
		lineHeight = "19px";
	};

	contentStyle = new class {
		left = "0";
		top = "0";
	};

	cursorStyle = new class {
		display = "none";
		height = "19px";
		left = "0";
		top = "0";
	};

	textareaStyle = new class {
		left = "0";
		top = "0";
		width = "1px";
		background = "transparent";
		height = "19px";
		fontSize = "14px";
		lineHeight = "19px";
		fontFamily = "'simsun', Consolas, 'Courier New', monospace";
	}

	selectRowStyle = new class {
		left = "0";
		top = "0";
		height = "19px";
	};

	selectMaskStyle:SelectLineItem[] = [];

	charWidth = 7;
	lineHeight = 19;
	needTestCharWidth = false;

	totalRow = 1;
	// selectRow = 0;
	cursorWordPos = { row: 0, col: 0 };
	cursorPos = { x: 0, y: 0 };
	isSelectVer = false;
	selectWordRange = { startRow: 0, startCol: 0, endRow:0, endCol: 0 };
	selectRange = { start: 0, len: 0 };
	contentPos = { x: 0, y: 0 };
	cursorHold = false;
	isIMEStart = false;

	keepCacheCursorSingleWordCol = false;
	cacheCursorSingleWordCol = 0;

	tableFill = [
		"",
		"&ensp;",
		"&ensp;&ensp;",
		"&ensp;&ensp;&ensp;",
		"&ensp;&ensp;&ensp;&ensp;",
	];

	isDown = false;
	downWordPos = { row: 0, col: 0 };

	// @Watch("textInput")
	// onTextInputChanged() {
	// 	// console.info(this.textInput);
	// }

	created() {
		this.horSlbMd.isVertical = false;
		this.verSlbMd.onChanging = a => this.onVerScrollbarChanging(a);
		this.horSlbMd.onChanging = a => this.onHorScrollbarChanging(a);
	}

	mounted() {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		ele.addEventListener("input", e => this.onTextareaChanged(e));
		ele.addEventListener("copy", e => this.onTextareaCopy(e));
		ele.addEventListener("cut", e => this.onTextareaCut(e));
		ele.addEventListener("paste", e => this.onTextareaPaste(e));
		ele.addEventListener("keydown", e => this.onTextareaKeydown(e), { passive: false });
		ele.addEventListener("compositionstart", e => this.onTextareaCompositionstart(e));
		ele.addEventListener("compositionend", e => this.onTextareaCompositionend(e));
		ele.addEventListener("compositionupdate", e => this.onTextareaCompositionupdate(e));
		ele.addEventListener("keyup", e => this.onTextareaKeyup(e));
		ele.addEventListener("mousedown", this.onTextareaMousedown, { passive: false });
		// ele.addEventListener("focus", e=>this.onTextareaFocus(e));
		// ele.addEventListener("selectstart", e=>this.onTextareaKeyup(e));

		var eleContentBox = this.$refs.contentBox as HTMLTextAreaElement;
		eleContentBox.addEventListener("scroll", evt => {
			eleContentBox.scrollTop = 0;
			// console.info(evt);
		});

		document.addEventListener("mousemove", this.anoOnDocMousemove, { passive: false });
		document.addEventListener("mouseup", this.anoOnDocMouseup, { passive: false });

		this.testCharWidth();
	}

	destryed() {
		document.removeEventListener("mousemove", this.anoOnDocMousemove);
		document.removeEventListener("mouseup", this.anoOnDocMouseup);
	}

	isShowScrollbar(md: ScrollbarMd) {
		return md.contentSize > 0 && md.contentSize < 100;
	}

	onVerScrollbarChanging(val) {
		// var textHeight = (this.totalRow - 1) * this.lineHeight;
		// this.contentPos.y = -textHeight * (val/100);
		// this.contentStyle.top = this.contentPos.y + "px";

		this.contentPos.y = -val;
		this.contentStyle.top = this.contentPos.y + "px";
	}

	onHorScrollbarChanging(val) {
		var ele = this.$refs.contentBox as HTMLDivElement;
		var width = ele.clientWidth;
		this.contentPos.x = -width * (100 - this.horSlbMd.contentSize) / 100 * (val / 100);
		this.contentStyle.left = this.contentPos.x + "px";
	}

	updateSpaceRender() {
		var str = this.option.spaceRender;
		var arr = [];
		for (var i = 0; i < 5; ++i) {
			var tmp = "";
			for (var j = 0; j < i; ++j) {
				tmp += str;
			}
			arr.push(tmp);
		}
		this.tableFill = arr;
	}

	updateOptions(opt: EditorOption) {
		for (var key in opt) {
			this.option[key] = opt[key];
		}

		if ("spaceRender" in opt) {
			this.updateSpaceRender();
		}

		if (this.option.model.editor != this) {
			this.option.model.setEditor(this);
		}

		if (this.rootStyle.fontFamily != this.option.fontFamily) {
			this.testCharWidth();
		}

		this.rootStyle.fontFamily = this.option.fontFamily;
		this.textareaStyle.fontFamily = this.option.fontFamily;
		this.updateFont();
	}

	updateFont() {
		var height = this.option.fontSize + 5;
		var strH = height + "px";
		this.lineHeight = height;

		this.rootStyle.fontSize = this.option.fontSize + "px";
		this.textareaStyle.fontSize = this.option.fontSize + "px";
		this.textareaStyle.lineHeight = strH;
		this.textareaStyle.height = strH;
		this.lineStyle.height = strH;
		this.cursorStyle.height = strH;
		this.selectRowStyle.height = strH;

		this.lineNoMd.fontSize = this.option.fontSize;
		this.lineNoMd.height = height;
		this.lineStyle.lineHeight = this.lineStyle.height;

		this.updateSelectRangeHieght();
	}

	// getLineHeight() {
	// 	return this.option.fontSize + 5;
	// }

	layout() {
		// var md = this.option.model;
		// var rows = md.getLineCount();
		// var lineHeight = this.lineHeight;
		// var ele = this.$refs.contentBox as HTMLDivElement;
		// var textHeight = rows * lineHeight;
		// var verSize = ele.clientHeight / (textHeight + ele.clientHeight) * 100;
		// // console.info(verSize, textHeight, ele.clientHeight);
		// this.verSlbMd.contentSize = verSize;
		this.updateVerSlbSize();

		if (this.needTestCharWidth) {
			this.needTestCharWidth = false;
			this.testCharWidth();
		}
	}

	onOver() {
		// console.info("over");
		this.isMouseOver = true;
		this.verSlbMd.isMouseOver = true;
		this.horSlbMd.isMouseOver = true;
	}

	onOut() {
		this.isMouseOver = false;
		this.verSlbMd.isMouseOver = false;
		this.horSlbMd.isMouseOver = false;
	}

	testCharWidth() {
		if (this.needTestCharWidth) {
			return;
		}

		var ele = this.$refs.charTest as HTMLSpanElement;
		ele.style.fontFamily = this.option.fontFamily;
		ele.innerHTML = "a";

		var width = ele.getBoundingClientRect().width;
		// console.info("aaa", width);
		if (width == 0) {
			this.needTestCharWidth = true;
			return;
		}

		if (width == this.charWidth) {
			return;
		}

		this.charWidth = width;
		// this.$nextTick(()=>{
		// });
	}

	setValue(str) {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		ele.value = str;
		this.onTextareaChanged(null);
		// this.updateCursorByWordPos();
		this.setSelectRange(false, 0, 0, 0, 0);
	}

	updateCursorByWordPos() {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		var startPos = ele.selectionStart;
		// console.info(startPos);
		var val = ele.value.replace(/\r\n/g, "\n");
		var arr = val.split("\n");
		var tmpLen = 0;
		var row = 0;
		var col = 0;
		// var str = "";
		for (var i = 0; i < arr.length; ++i) {
			if (tmpLen + arr[i].length + i >= startPos) {
				row = i;
				col = startPos - tmpLen - i;
				// str = arr[i].substr(0, col);
				break;
			}
			tmpLen += arr[i].length;
		}

		if (arr.length != this.totalRow) {
			this.totalRow = arr.length;
			this.udpateTotalRow();
		}

		this.cursorWordPos.col = col;
		if (row != this.cursorWordPos.row) {
			this.cursorWordPos.row = row;
			this.updateSelectRow();
		}

		var xsize = this.calcTextLen(arr[row].substr(0, col));
		if (!this.keepCacheCursorSingleWordCol) {
			this.cacheCursorSingleWordCol = xsize;
		}
		this.cursorPos.x = xsize * this.charWidth;
		this.cursorPos.y = row * this.lineHeight;
		this.updateCursor();
	}

	getFullShowRows() {
		// var ele = this.$refs.contentBox as HTMLDivElement;
		var height = this.getContentHeight();
		return Math.floor(height / this.lineHeight);
	}

	getShowRows() {
		// var ele = this.$refs.contentBox as HTMLDivElement;
		var height = this.getContentHeight();
		return Math.ceil(height / this.lineHeight);
	}

	updateVerSlbSize() {
		var height = this.getContentHeight();
		// var textHeight = (this.totalRow - 1) * this.lineHeight;
		// var verSize = height / (textHeight + height) * 100;
		// this.verSlbMd.contentSize = verSize;

		var count = (this.totalRow - 1) * this.lineHeight;
		this.verSlbMd.contentSize = height / (height + count) * 100;
		this.verSlbMd.count = count;
	}

	udpateTotalRow() {
		this.updateLineNoRow();
		this.updateVerSlbSize();

		this.limitScroll();
		// var ele = this.$refs.slbVer as IScrollbar;
		// this.onVerScrollbarChanging(ele.getValue());
	}

	updateLineNoRow() {
		// var showRows = this.getShowRows();
		// if(this.lineNoMd.start + showRows > this.totalRow) {
		// 	showRows = this.totalRow - this.lineNoMd.start;
		// }
		// this.lineNoMd.count = showRows;

		this.lineNoMd.count = this.totalRow;
	}

	updateSelectRow() {
		var row = this.cursorWordPos.row;
		this.lineNoMd.activeLine = row;
		this.selectRowStyle.top = (row * this.lineHeight) + "px";
	}

	updateCursor() {
		var x = this.cursorPos.x + "px";
		var y = this.cursorPos.y + "px";
		this.cursorStyle.left = x;
		this.cursorStyle.top = y;

		this.textareaStyle.left = x;
		this.textareaStyle.top = y;
	}

	calcTextLen(str) {
		// str = str.replace(/[^\u0000-\u00FF]/g, "  ");
		var len = 0;
		for (var j = 0; j < str.length; ++j) {
			if (str.charAt(j) == '\t') {
				len += 4 - (len % 4);
				continue;
			}
			var no = str.charCodeAt(j);
			if (no >= 0 && no <= 0xff) {
				len += 1;
			} else {
				len += 2;
			}
		}

		return len;
	}

	getRenderText(str) {
		// str = str.replace(/&/g, "&amp;");
		// str = str.replace(/[ ]/g, this.option.spaceRender);
		// str = str.replace(/&/g, "&amp;");
		// str = str.replace(/</g, "&lt;");
		// str = str.replace(/>/g, "&gt;");

		var len = 0;
		var rst = "";
		for (var i = 0; i < str.length; ++i) {
			var no = str.charCodeAt(i);
			var ch = str.charAt(i);
			if (no > 0xff) {
				len += 2;
				rst += ch;
				continue;
			}
			if (ch == '\t') {
				var count = 4 - (len % 4);
				len += count;
				rst += this.tableFill[count];
				continue;
			}
			switch (ch) {
				case "&": rst += "&amp;"; break;
				case "<": rst += "&lt;"; break;
				case ">": rst += "&gt;"; break;
				default: rst += ch; break;
			}
			len += 1;
		}
		// str = str.replace(/"/g, "&");

		return rst;
	}

	formatText(str) {
		var arr = str.replace(/\r\n/g, "\n").split("\n");
		var rst = [];
		var pos = 0;
		for (var i = 0; i < arr.length; ++i) {
			var line = new TextLine();
			line.pos = pos + i;

			var md = new TextItem();
			md.value = arr[i];
			md.renderVlaue = this.getRenderText(arr[i]);
			md.singleWordLength = this.calcTextLen(md.value);
			line.data.push(md);

			line.length = md.value.length;
			line.singleWordLength = md.singleWordLength;

			rst.push(line);

			pos += arr[i].length
		}

		return rst;
	}

	onTextareaChanged(evt) {
		// console.info(evt);
		// if(this.isIMEStart) {
		// 	return;
		// }

		var ele = this.$refs.textarea as HTMLTextAreaElement;
		var val = ele.value;
		// var arr = val.replace(/\r\n/g, "\n").split("\n");
		this.lines = this.formatText(val);
		// switch(evt.inputType) {
		// 	case "insertText": {
		// 		// insert
		// 		if(!evt.data) {
		// 			break;
		// 		}
		// 		var ch = evt.data.charCodeAt(0);
		// 		if(this.cursorPos.x == 0) {
		// 			this.cursorPos.x = 1;
		// 		}
		// 		if (ch >= 0 && ch <= 0xff) {
		// 			this.cursorPos.x += this.option.fontSize / 2;
		// 		} else {
		// 			this.cursorPos.x += this.option.fontSize;
		// 		}
		// 		break;
		// 	}
		// 	case "insertFromPaste": {
		// 		// paste
		// 		var str = this.lastTextareaPaste;
		// 		var arr = str.replace(/\r\n/g, "\n").split("\n");
		// 		this.cursorPos.y += (arr.length - 1) * this.getLineHeight();
		// 		var len = this.calcTextLen(arr[arr.length-1]);
		// 		if(this.cursorPos.x == 0) {
		// 			this.cursorPos.x = 1;
		// 		}
		// 		this.cursorPos.x += len * this.option.fontSize / 2;
		// 	}
		// 	case "deleteContentBackward": {
		// 		// delete backward
		// 	}
		// 	case "deleteContentForward": {
		// 		// delete forward
		// 	}
		// }
		if (!this.isIMEStart) {
			this.updateCursorByWordPos();
		}

		// if(evt.data) {
		// 	var ch = evt.data.charCodeAt(0);
		// 	if(this.cursorPos.x == 0) {
		// 		this.cursorPos.x = 1;
		// 	}
		// 	if (ch >= 0 && ch <= 0xff) {
		// 		this.cursorPos.x += this.option.fontSize / 2;
		// 	} else {
		// 		this.cursorPos.x += this.option.fontSize;
		// 	}
		// }

		this.textInput = val;
		// this.updateCursor();
		// console.info(evt);
	}

	// updateView() {
	// 	var ele = this.$refs.textarea as HTMLTextAreaElement;
	// 	var val = ele.value;
	// 	var arr = val.replace(/\r\n/g, "\n").split("\n");
	// }

	onTextareaPaste(evt) {
		if (!evt.clipboardData) {
			this.lastTextareaPaste = "";
			return;
		}
		var val = evt.clipboardData.getData('text/plain');
		this.lastTextareaPaste = "" + val;
		// console.info("paste", evt.clipboardData.getData('text/plain'));
	}

	getContentHeight() {
		var ele = this.$refs.contentBox as HTMLDivElement;
		return ele.clientHeight;
	}

	limitScroll() {
		// var height = this.getContentHeight();
		var rowHeight = (this.totalRow - 1) * this.lineHeight;
		var pos = this.contentPos.y + rowHeight;
		// console.info(pos, this.contentPos.y, rowHeight, this.totalRow);
		if (pos < 0) {
			var val = this.pxToScrollVal(true, rowHeight);
			// console.info("bbb", val);
			var ele = this.$refs.slbVer as IScrollbar;
			var oldValue = ele.getValue();
			// console.info(val, oldValue);
			if (val == oldValue) {
				this.onVerScrollbarChanging(val);
			} else {
				ele.setValue(val);
			}
		}
	}

	scrollToRow(row) {
		var height = this.getContentHeight();

		// var row = this.cursorWordPos.row;
		var rowHeight = row * this.lineHeight;
		var pos = this.contentPos.y + rowHeight;
		// console.info(row, pos, height);
		// var val = NaN;
		if (pos + this.lineHeight * 2 >= height) {
			var val = this.pxToScrollVal(true, rowHeight + this.lineHeight * 2 - height);
			// console.info("aaa", val);
			var ele = this.$refs.slbVer as IScrollbar;
			ele.setValue(val);
		} else if (pos < 0) {
			var val = this.pxToScrollVal(true, rowHeight);
			// console.info("bbb", val);
			var ele = this.$refs.slbVer as IScrollbar;
			ele.setValue(val);
		}
	}

	onTextareaCompositionstart(evt) {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		ele.style.height = this.lineHeight + "px";
		ele.scrollTop = this.lineHeight * this.cursorWordPos.row;

		this.isIMEStart = true;
		this.textareaStyle.background = "#1e1e1e";
		this.textareaStyle.height = this.lineHeight + "px";
		this.cursorStyle.display = "none";
		// console.info("start");
	}

	onTextareaCompositionend(evt) {
		this.isIMEStart = false;
		this.textareaStyle.width = "1px";
		this.textareaStyle.height = "19px";
		this.textareaStyle.background = "transparent";
		this.cursorStyle.display = "";
		this.onTextareaChanged(null);
		// console.info("end");
	}

	onTextareaCompositionupdate(evt) {
		// console.info(evt);
		var str = evt.data;
		var len = str.length * this.charWidth + 1;
		this.textareaStyle.width = len + "px";
	}

	setTextAreaCursorPos(pos, row = -1) {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		ele.selectionStart = ele.selectionEnd = pos;
		if (row < 0) {
			ele.scrollTop = this.lineHeight * this.cursorWordPos.row;
		} else {
			ele.scrollTop = this.lineHeight * row;
		}
		ele.scrollLeft = 0;
	}

	onTextareaKeydown(evt) {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		// console.info("keydown", ele.selectionStart, ele.selectionEnd);
		// console.info("keydown", evt.keyCode, evt.key, evt);

		if (this.isIMEStart) {
			return;
		}

		// readonly
		if (this.option.readOnly) {
			evt.preventDefault && evt.preventDefault();
			return;
		}

		// ctrl
		if (evt.ctrlKey) {
			switch (evt.keyCode) {
				case 90: {
					// z
					break;
				}
				case 89: {
					// y
					break;
				}
				case 65: {
					// a
					break;
				}
				case 67: {
					// c
					break;
				}
				case 86: {
					// v
					break;
				}
				case 83: {
					// s
					break;
				}
			}

			evt.preventDefault && evt.preventDefault();
			return;
		}

		var startPos = ele.selectionStart;

		// enter
		// var gap = evt.keyCode == 13 ? 1 : 0;
		// var row = this.cursorWordPos.row + gap;

		var scrollRow = this.cursorWordPos.row;

		var prevent = true;
		switch (evt.keyCode) {
			case 9: {
				// tab
				this.cursorHold = true;
				this.insertText("\t");
				this.onTextareaChanged(null);
				break;
			}
			case 13: {
				// enter
				prevent = false;
				scrollRow += 1;
				break;
			}
			case 37: {
				// left
				if (startPos > 0) {
					this.cursorHold = true;
					// ele.selectionStart = ele.selectionEnd = startPos - 1;
					this.setTextAreaCursorPos(startPos - 1);
					this.updateCursorByWordPos();
				} else {
					this.cursorHold = false;
				}
				break;
			}
			case 39: {
				// right
				if (startPos < ele.value.length) {
					// console.info("aaa", startPos, ele.value.length);
					this.cursorHold = true;
					// ele.selectionStart = ele.selectionEnd = startPos + 1;
					this.setTextAreaCursorPos(startPos + 1);
					this.updateCursorByWordPos();
				} else {
					this.cursorHold = false;
				}
				break;
			}
			case 36: {
				// home
				var col = this.cursorWordPos.col;
				if (col != 0) {
					this.cursorHold = true;
					var row = this.cursorWordPos.row;
					// ele.selectionStart = ele.selectionEnd = this.lines[row].pos;
					this.setTextAreaCursorPos(this.lines[row].pos);
					this.updateCursorByWordPos();
				} else {
					this.cursorHold = false;
				}
				break;
			}
			case 35: {
				// end
				var row = this.cursorWordPos.row;
				var col = this.cursorWordPos.col;
				// console.info(col, this.lines[row].length);
				if (col < this.lines[row].length) {
					this.cursorHold = true;
					var row = this.cursorWordPos.row;
					// ele.selectionStart = ele.selectionEnd = this.lines[row].pos + this.lines[row].length;
					this.setTextAreaCursorPos(this.lines[row].pos + this.lines[row].length);
					this.updateCursorByWordPos();
				} else {
					this.cursorHold = false;
				}
				break;
			}
			case 38: {
				// up
				scrollRow = this.jumpToRow(this.cursorWordPos.row - 1);
				break;
			}
			case 40: {
				// down
				scrollRow = this.jumpToRow(this.cursorWordPos.row + 1);
				break;
			}
			case 33: {
				// page up
				var rows = this.getFullShowRows() - 1;
				scrollRow = this.jumpToRow(this.cursorWordPos.row - rows);
				break;
			}
			case 34: {
				// page down
				var rows = this.getFullShowRows() - 1;
				scrollRow = this.jumpToRow(this.cursorWordPos.row + rows);
				break;
			}
			case 8: {
				// backspace
				this.cursorHold = true;
				prevent = false;
				if (scrollRow > 0 && this.cursorWordPos.col == 0) {
					scrollRow -= 1;
				}
				break;
			}
			// case 46: {
			// 	// delete
			// 	break;
			// }
			default: {
				this.cursorHold = true;
				prevent = false;
				break;
			}
		}

		this.scrollToRow(scrollRow);

		if (prevent) {
			evt.preventDefault && evt.preventDefault();
		}
	}

	jumpToRow(newRow) {
		if (newRow >= this.totalRow) {
			newRow = this.totalRow - 1;
		} else if (newRow < 0) {
			newRow = 0;
		}

		var row = this.cursorWordPos.row;
		if (newRow == row) {
			this.cursorHold = false;
			return row;
		}

		this.cursorHold = true;

		var len = this.cacheCursorSingleWordCol;
		var newStr = this.lines[newRow].getLineStr();
		var newCol = this.calcPosBySingleWordPos(newStr, len);

		this.setTextAreaCursorPos(this.lines[newRow].pos + newCol, newRow);
		this.keepCacheCursorSingleWordCol = true;
		this.updateCursorByWordPos();
		this.keepCacheCursorSingleWordCol = false;

		return newRow;
	}

	onTextareaKeyup(evt) {
		// console.info("keyup", evt);
		this.cursorHold = false;
	}

	onTextareaCut(evt) {
		// console.info("copy", evt);
	}

	onTextareaCopy(evt) {
		// console.info("copy", evt);
	}

	onTextareaMousedown(evt) {
		// console.info("copy", evt);
		// evt.preventDefault && evt.preventDefault();
	}

	// onTextareaFocus(evt) {
	// 	console.info("focus", evt);
	// }

	calcPosBySingleWordPos(str, col) {
		// var len = this.calcTextLen(str);
		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			var width = 0;
			if (str.charAt(i) == '\t') {
				width = 4 - (len % 4);
				// len += width;
				// continue;
			} else {
				var no = str.charCodeAt(i);
				if (no >= 0 && no <= 0xff) {
					width = 1;
					// len += 1;
				} else {
					width = 2;
					// len += 2;
				}
			}
			if (col <= len + width / 2) {
				return i;
			} else if (col <= len + width) {
				return i + 1;
			}
			len += width;
		}

		return str.length;
	}

	calcPos(str, px): number {
		var totalPx = 0;
		// var rst = 0;

		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			var no = str.charCodeAt(i);
			var ch = str.charAt(i);
			var chw = this.charWidth;
			if (no > 0xff) {
				len += 2;
				chw = this.charWidth * 2;
			} else if (ch == '\t') {
				var tmp = 4 - (len % 4);
				len += tmp;
				chw = tmp * this.charWidth;
			} else {
				len += 1;
			}
			if (px < totalPx + chw / 2) {
				return i;
			} else if (px < totalPx + chw) {
				return i + 1;
			}
			totalPx += chw;
			// len += 1;
		}
		return str.length;
	}

	onContentBoxMouseDownBack(evt) {
		
	}

	onContentBoxMouseDownLineNumber(evt) {
		
	}

	onContentBoxMouseDownMask(evt) {
		// right mouse down
		if(evt.button == 2) {
			return;
		}

		this.setEditorFocus();

		var row = this.lines.length - 1;
		var col = this.lines[row].length;
		this.markDownPos(evt, row, col);

		var ele = this.$refs.textarea as HTMLTextAreaElement;
		this.setTextAreaCursorPos(ele.value.length);
		this.updateCursorByWordPos();
		return;
	}

	onContentBoxMouseDownMainArea(evt) {
		// right mouse down
		if(evt.button == 2) {
			return;
		}

		this.setEditorFocus();

		var eleDown = evt.target as HTMLElement;
		var row = parseInt(eleDown.getAttribute("row"));
		var startCol = parseInt(eleDown.getAttribute("col"));
		if (isNaN(row) || row < 0 || row >= this.lines.length) {
			return;
		}

		var line = this.lines[row];
		var pos = 0;
		var col = 0;
		if (isNaN(startCol)) {
			col = line.length;
			// pos = line.pos + line.length;
		} else {
			var px = evt.layerX;
			col = this.calcPos(line.getLineStr(), px);
			// pos = line.pos + this.calcPos(line.getLineStr(), px);
			// console.info(line.pos, this.charWidth, pos, px, this.calcPos(line.getLineStr(), px), line.getLineStr());
		}
		pos = line.pos + col;
		this.markDownPos(evt, row, col);

		// ele.selectionStart = ele.selectionEnd = pos;
		this.setTextAreaCursorPos(pos);
		this.updateCursorByWordPos();
	}

	setEditorFocus() {
		if(this.isFocus) {
			return;
		}

		var ele = this.$refs.textarea as HTMLTextAreaElement;
		ele.focus();

		this.isFocus = true;
		this.cursorStyle.display = "";
	}

	markDownPos(evt, row, col) {
		this.isDown = true;
		this.downWordPos.row = row;
		this.downWordPos.col = col;

		this.setSelectRange(false, row, col, row, col);

		// this.selectWordRange.startRow = this.selectWordRange.endRow = row;
		// this.selectWordRange.startCol = this.selectWordRange.endCol = col;
		// this.updateSelectRange();
	}

	updateSelectRangeHieght() {
		var arr = this.selectMaskStyle;
		var strH = this.lineHeight + "px";
		for(var i = 0; i < arr.length; ++i) {
			arr[i].style.height = strH;
		}
	}

	isSelectRange() {
		var md = this.selectWordRange;
		return !(md.startRow == md.endRow && md.startCol == md.endCol);
	}

	setSelectRange(_isSelectVer, startRow, startCol, endRow, endCol) {
		this.isSelectVer = _isSelectVer;
		this.selectWordRange.startRow = startRow;
		this.selectWordRange.startCol = startCol;
		this.selectWordRange.endRow = endRow;
		this.selectWordRange.endCol = endCol;
		// if(this.totalRow > 3) {
		// 	this.selectWordRange.startRow = 0;
		// 	this.selectWordRange.startCol = 0;
		// 	this.selectWordRange.endRow = 2;
		// 	this.selectWordRange.endCol = this.lines[2].length;
		// }
		this.updateSelectRange();
	}

	updateSelectRange() {
		var arr: SelectLineItem[] = [];
		var md = this.selectWordRange;
		// var lineHeight = this.lineHeight;
		var strH = this.lineHeight + "px";
		for(var i = md.startRow; i <= md.endRow; ++i) {
			if(i < 0 || i >= this.totalRow) {
				break;
			}
			var tmp = new SelectLineItem();
			tmp.style.top = i * this.lineHeight + "px";
			tmp.style.height = strH;
			var left = 0;
			var right = 0;
			var str = this.lines[i].getLineStr();
			if(i == md.startRow) {
				// var str = str.substr(0, md.startCol);
				left = this.calcTextLen(str.substr(0, md.startCol));
			}
			
			if(i == md.endRow) {
				// var str = str.substr(0, md.endCol);
				right = this.calcTextLen(str.substr(0, md.endCol));
			} else {
				right = this.calcTextLen(str) + 1;
			}

			var tmp2 = new SelectMaskStyle();
			tmp2.style.left = left * this.charWidth + "px";
			tmp2.style.width = (right - left) * this.charWidth + "px";
			tmp.data.push(tmp2);
			arr.push(tmp);
		}

		this.selectMaskStyle = arr;
	}

	getElementPagePos(ele:HTMLElement) {
		// if (ele.style.display == 'none') {
		// 	return { x: 0, y: 0 };
		// }

		// IE
		if (ele.getBoundingClientRect) {
			var box = ele.getBoundingClientRect();
			var x = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
			var y = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			return { x: box.left + x, y: box.top + y };
		}

		var pos = [0, 0];
		var parent = ele.parentNode as HTMLElement;
		while (parent && parent.tagName != "BODY" && parent.tagName != "HTML") {
			pos[0] -= parent.scrollLeft;
			pos[1] -= parent.scrollTop;
			parent = parent.parentNode as HTMLElement;
		}
		return { x: pos[0], y: pos[1] };
	}

	anoOnDocMousemove = e=>this.onDocMousemove(e);
	onDocMousemove(evt) {
		if(!this.isDown) {
			return;
		}

		var ele = this.$refs.contentBox as HTMLDivElement;
		ele.clientTop
		var pos = this.getElementPagePos(ele);
		var contHeight = ele.clientHeight;
		var contWidth = ele.clientWidth;
		var dx = evt.pageX - pos.x;
		var dy = evt.pageY - pos.y;
		if(dx < 0) {
			dx = 0;
		} else if(dx > contWidth) {
			dx = contWidth;
		}
		if(dy < 0) {
			dy = 0;
		} else if(dy > contHeight) {
			dy = contHeight;
		}
		var row = Math.floor((dy - this.contentPos.y) / this.lineHeight);
		if(row < 0) {
			row = 0;
		} else if(row >= this.totalRow) {
			row = this.totalRow - 1;
		}

		var line = this.lines[row];
		var col = this.calcPos(line.getLineStr(), dx - this.contentPos.x - this.lineNoMd.width);
		// var nowCol = Math.floor((dx - this.contentPos.x) / this.charWidth);
		var startRow = this.downWordPos.row;
		var startCol = this.downWordPos.col;
		var endRow = row;
		var endCol = col;
		if(startRow > endRow || (startRow==endRow && startCol > endCol)) {
			startRow = row;
			startCol = col;
			endRow = this.downWordPos.row;
			endCol = this.downWordPos.col;
		}

		this.setSelectRange(false, startRow, startCol, endRow, endCol);

		var curPos = this.getCursorPosByTablePos(row, col);
		this.setTextAreaCursorPos(curPos);
		this.updateCursorByWordPos();
		
		// log(startRow, startCol, endRow, endCol);
	}

	getCursorPosByTablePos(row, col) {
		if(row < 0 || row >= this.totalRow) {
			return 0;
		}

		return this.lines[row].pos + col;
	}

	anoOnDocMouseup = e=>this.onDocMouseup(e);
	onDocMouseup(evt) {
		this.isDown = false;
	}

	// onContentBoxMousedown(evt) {
	// 	// not left mouse down
	// 	if(evt.button != 0) {
	// 		return;
	// 	}
		
	// 	evt.preventDefault && evt.preventDefault();

	// 	var ele = this.$refs.textarea as HTMLTextAreaElement;

	// 	// console.info(evt);
	// 	var eleMask = this.$refs.contentMask as HTMLDivElement;
	// 	var eleDown = evt.target as HTMLElement;
	// 	if (eleDown == eleMask) {
	// 		// ele.selectionStart = ele.selectionEnd = ele.value.length;
	// 		this.setTextAreaCursorPos(ele.value.length);
	// 		this.updateCursorByWordPos();
	// 		return;
	// 	}
	// 	var row = parseInt(eleDown.getAttribute("row"));
	// 	var col = parseInt(eleDown.getAttribute("col"));
	// 	if (isNaN(row) || row < 0 || row >= this.lines.length) {
	// 		return;
	// 	}

	// 	// console.info(row, col);

	// 	var line = this.lines[row];
	// 	var pos = 0;
	// 	if (isNaN(col)) {
	// 		pos = line.pos + line.length;
	// 	} else {
	// 		var px = evt.layerX;
	// 		pos = line.pos + this.calcPos(line.getLineStr(), px);
	// 		// console.info(line.pos, this.charWidth, pos, px, this.calcPos(line.getLineStr(), px), line.getLineStr());
	// 	}
	// 	// ele.selectionStart = ele.selectionEnd = pos;
	// 	this.setTextAreaCursorPos(pos);
	// 	this.updateCursorByWordPos();
	// 	// console.info(row, col);
	// }

	onMousedown(evt) {
		evt.preventDefault && evt.preventDefault();
		// console.info("111", ele.selectionStart, ele.value.replace("\n", "11"));
	}

	insertText(str) {
		var ele = this.$refs.textarea as HTMLTextAreaElement;
		// if (document["selection"]) {
		// 	var sel = document["selection"].createRange();
		// 	sel.text = str;
		// } else
		// if (typeof (ele.selectionStart) === 'number' && typeof (ele.selectionEnd) === 'number') {
		// 	var startPos = ele.selectionStart;
		// 	var endPos = ele.selectionEnd;
		// 	var cursorPos = startPos;
		// 	var tmpStr = ele.value;

		// 	ele.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
		// 	cursorPos += str.length;
		// 	ele.selectionStart = ele.selectionEnd = cursorPos;
		// } else {
		// 	ele.value += str;
		// }

		var startPos = ele.selectionStart;
		var endPos = ele.selectionEnd;
		var nowPos = startPos;
		var tmp = ele.value;

		ele.value = tmp.substring(0, startPos) + str + tmp.substr(endPos);
		nowPos += str.length;
		// ele.selectionStart = ele.selectionEnd = nowPos;
		this.setTextAreaCursorPos(nowPos);
	}

	onMouseup(evt) {
		// console.info("aaa", ele);
	}

	pxToScrollVal(isVer, pxVal) {
		return pxVal;
		// var ele = this.$refs.contentBox as HTMLDivElement;
		if (isVer) {
			if (this.totalRow <= 1) {
				return 0;
			}
			var textHeight = (this.totalRow - 1) * this.lineHeight;
			// console.info(pxVal, textHeight, this.totalRow, this.lineHeight);
			return pxVal / (textHeight) * 100;
		} else {
			return 0;
		}
	}

	setScrollVal(isVer, val) {
		if (isVer) {
			var ele = this.$refs.slbVer as IScrollbar;
			ele.setValue(val);
		} else {
			var ele = this.$refs.slbHor as IScrollbar;
			ele.setValue(val);
		}
	}

	onMousewheel(evt) {
		var val = evt.wheelDelta;

		if (evt.shiftKey) {
			return;
		}

		var scrollVal = this.pxToScrollVal(true, 125) * (val > 0 ? -1 : 1);

		var ele = this.$refs.slbVer as IScrollbar;
		ele.setValue(ele.getValue() + scrollVal);
	}

	onTextareaBlur() {
		this.isFocus = false;
		this.cursorHold = false;
		this.cursorStyle.display = "none";
	}
}
