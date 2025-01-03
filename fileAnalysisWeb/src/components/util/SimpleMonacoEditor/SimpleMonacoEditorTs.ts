
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';

import { VIgnore } from '@/sdk/tsHelp/vue/VIgnore';
import ContentBack from './view/contentBack/ContentBack.vue';
import IContentBack from './view/contentBack/ContentBackTs';
import ContentMain from './view/contentMain/ContentMain.vue';
import IContentMain from './view/contentMain/ContentMainTs';
import ContentFill from './view/contentFill/ContentFill.vue';
import IContentFill from './view/contentFill/ContentFillTs';
import LineNumberBox from './view/lineNumberBox/LineNumberBox.vue';
import Scrollbar from './view/scrollbar/Scrollbar.vue';
import IScrollbar, { ScrollbarMd } from './view/scrollbar/ScrollbarTs';
import { LineNumberMd } from './view/lineNumberBox/LineNumberBoxTs';
import { EditorOption } from '@/components/util/SimpleMonacoEditor/model/EditorOption';
import { TextLine, TextItem } from '@/components/util/SimpleMonacoEditor/model/TextLine';
import CheckInsert from '@/components/util/SimpleMonacoEditor/control/CheckInsert';
import ComEditCtl from '@/components/util/SimpleMonacoEditor/control/ComEditCtl';
import EditorKeyDownCtl from '@/components/util/SimpleMonacoEditor/control/EditorKeyDownCtl';
import HistoryCtl from '@/components/util/SimpleMonacoEditor/control/HistoryCtl';

@Comp({ ContentBack, ContentMain, ContentFill, Scrollbar, LineNumberBox })
export default class SimpleMonacoEditor extends Vue {
	// lines: TextLine[] = [new TextLine()];

	isMouseOver = false;
	isFocus = false;

	@VIgnore()
	option = new EditorOption();

	@VIgnore()
	checkInsert = new CheckInsert();

	@VIgnore()
	comCtl = new ComEditCtl();
	
	@VIgnore()
	keyDownCtl = new EditorKeyDownCtl();
	@VIgnore()
	historyCtl = new HistoryCtl();

	// @VIgnore()
	// cacheText = new CacheText();

	verSlbMd = new ScrollbarMd();
	horSlbMd = new ScrollbarMd();
	lineNoMd = new LineNumberMd();

	textInput = "";
	lastTextareaPaste = "";

	rootStyle = new class {
		fontSize = "14px";
		fontFamily = "'simsun', Consolas, 'Courier New', monospace";
	};

	contentStyle = new class {
		left = "0";
		top = "0";
	};

	editBoxStyle = new class {
		left = "0";
	}

	charWidth = 7;
	lineHeight = 19;
	needTestCharWidth = false;

	totalRow = 1;
	// selectRow = 0;
	cursorWordPos = { row: 0, col: 0 };
	cursorPos = { x: 0, y: 0 };
	isSelectVer = false;
	selectWordRange = { startRow: 0, startCol: 0, endRow:0, endCol: 0 };
	selectStartPos = { row: 0, col: 0 };
	selectRange = { start: 0, len: 0 };
	contentPos = { x: 0, y: 0 };
	cursorHold = false;
	isIMEStart = false;

	maxSingleWordWidth = 0;

	keepCacheCursorSingleWordCol = false;
	cacheCursorSingleWordCol = 0;

	isDown = false;
	mouseDownPos = { x: 0, y: 0 };
	downWordPos = { row: 0, col: 0 };

	lastRemoveSelectStringPos = -1;
	lastRemoveSelectString = "";
	lastChangeString = "";
	isLastKeyRemove = false;
	lastInsertKeyCode = -1;

	created() {
		this.historyCtl.editor = this;

		this.horSlbMd.isVertical = false;
		this.verSlbMd.onChanging = a => this.onVerScrollbarChanging(a);
		this.horSlbMd.onChanging = a => this.onHorScrollbarChanging(a);
	}

	mounted() {
		var ele = this.getInput();
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

		var eleContentBox = this.$refs.contentBox as HTMLTextAreaElement;
		eleContentBox.addEventListener("scroll", evt => {
			eleContentBox.scrollTop = 0;
		});

		document.addEventListener("mousemove", this.anoOnDocMousemove, { passive: false });
		document.addEventListener("mouseup", this.anoOnDocMouseup, { passive: false });

		// this.testCharWidth();
		this.getContFill().testCharWidth();
	}

	destryed() {
		document.removeEventListener("mousemove", this.anoOnDocMousemove);
		document.removeEventListener("mouseup", this.anoOnDocMouseup);
	}

	isShowScrollbar(md: ScrollbarMd) {
		return md.contentSize > 0 && md.contentSize < 100;
	}

	onVerScrollbarChanging(val) {
		this.contentPos.y = -val;
		this.contentStyle.top = this.contentPos.y + "px";
	}

	onHorScrollbarChanging(val) {
		// var ele = this.$refs.contentBox as HTMLDivElement;
		// var width = ele.clientWidth;
		// this.contentPos.x = -width * (100 - this.horSlbMd.contentSize) / 100 * (val / 100);
		// this.contentStyle.left = this.contentPos.x + "px";

		// var ele = this.$refs.editBox as HTMLDivElement;
		// var width = ele.clientWidth;
		this.contentPos.x = -val;
		this.editBoxStyle.left = this.contentPos.x + "px";
	}

	updateOptions(opt: EditorOption) {
		for (var key in opt) {
			this.option[key] = opt[key];
		}

		if (this.option.model.editor != this) {
			this.option.model.setEditor(this);
		}

		if (this.rootStyle.fontFamily != this.option.fontFamily) {
			// this.testCharWidth();
			this.getContFill().testCharWidth();
		}

		this.rootStyle.fontFamily = this.option.fontFamily;
		// this.textareaStyle.fontFamily = this.option.fontFamily;
		if("fontFamily" in opt) {
			this.getContFill().updateFont(this.option.fontFamily);
		}
		this.updateFontSize();
	}

	getInput() {
		var view = this.$refs.contFill as IContentFill;
		return view.$refs.textarea as HTMLTextAreaElement;
	}

	getContBack() {
		return this.$refs.contBack as IContentBack;
	}

	getContMain() {
		return this.$refs.contMain as IContentMain;
	}

	getContFill() {
		return this.$refs.contFill as IContentFill;
	}

	getRowText(row) {
		return this.getContMain().getRowText(row);
	}

	getLines() {
		return this.getContMain().lines;
	}

	getRow(row) {
		return this.getContMain().lines[row];
	}

	getCursorTextPos() {
		var x = this.cursorWordPos.row;
		var y = this.cursorWordPos.col;
		return this.getRow(x).pos + y;
	}

	getCursorText(isNext = false) {
		var pos = this.getCursorTextPos();
		if(!isNext) {
			--pos;
		}
		if(pos < 0) {
			return "";
		}
		var str = this.getInput().value;
		if(pos >= str.length) {
			return "";
		}
		return str.charAt(pos);
	}

	updateFontSize() {
		var height = this.option.fontSize + 5;
		var strH = height + "px";
		this.lineHeight = height;

		this.rootStyle.fontSize = this.option.fontSize + "px";
		// this.lineStyle.height = strH;

		this.lineNoMd.fontSize = this.option.fontSize;
		this.lineNoMd.height = height;
		// this.lineStyle.lineHeight = this.lineStyle.height;

		this.getContMain().updateFontSize(this.option.fontSize, height);
		this.getContFill().updateRowHeight(height);
		this.getContBack().updateRowHeight(height);
	}

	layout() {
		this.updateVerSlbSize();
		this.updateHorSlbSize();

		if (this.needTestCharWidth) {
			this.needTestCharWidth = false;
			this.getContFill().testCharWidth();
		}
	}

	onOver() {
		this.isMouseOver = true;
		this.verSlbMd.isMouseOver = true;
		this.horSlbMd.isMouseOver = true;
	}

	onOut() {
		this.isMouseOver = false;
		this.verSlbMd.isMouseOver = false;
		this.horSlbMd.isMouseOver = false;
	}

	setValue(str) {
		// this.cacheText.setValue(str);
		// var aaa = "";
		// for(var i = 0; i < 6; ++i) {
		// 	for(var j = 0; j < 4; ++j) {
		// 		var ch = String.fromCharCode('a'.charCodeAt(0) + (i*4 + j));
		// 		aaa += ch+ch+ch+ch+ch;
		// 	}
		// 	if(i != 5) {
		// 		aaa+="\r\n";
		// 	}
		// }
		// this.cacheText.setValue(aaa);
		// console.info(111, this.cacheText.substr(0, -1));
		// console.info(111, this.cacheText.substr(21, 5));
		// console.info(111, this.cacheText.substr(42, 8));
		// console.info(111, this.cacheText.substr(63, 46));
		// console.info(111, this.cacheText.substr(84, 25));
		// console.info(111, this.cacheText.substr(105, 20));
		// console.info(111, this.cacheText.substr(125, 20));

		var ele = this.getInput();
		ele.value = str;
		this.onTextareaChanged(null);
		// this.updateCursorByWordPos();
		this.setSelectRange(false, 0, 0, 0, 0);

		this.historyCtl.clear();
		this.lastChangeString = "";
		this.isLastKeyRemove = false;
		this.lastInsertKeyCode = -1;
	}

	updateCursorByWordPos() {
		var ele = this.getInput();
		var startPos = ele.selectionStart;
		// console.info(startPos);
		// var val = ele.value.replace(/\r\n/g, "\n");
		// var arr = val.split("\n");
		var tmpLen = 0;
		var row = 0;
		var col = 0;
		// var str = "";
		// for (var i = 0; i < arr.length; ++i) {
		// 	if (tmpLen + arr[i].length + i >= startPos) {
		// 		row = i;
		// 		col = startPos - tmpLen - i;
		// 		// str = arr[i].substr(0, col);
		// 		break;
		// 	}
		// 	tmpLen += arr[i].length;
		// }

		var lines = this.getLines();
		for (var i = 0; i < lines.length; ++i) {
			if (tmpLen + lines[i].length + i >= startPos) {
				row = i;
				col = startPos - tmpLen - i;
				// str = arr[i].substr(0, col);
				break;
			}
			tmpLen += lines[i].length;
		}

		// if (arr.length != this.totalRow) {
		// 	this.totalRow = arr.length;
		// 	this.udpateTotalRow();
		// }

		this.cursorWordPos.col = col;
		if (row != this.cursorWordPos.row) {
			this.cursorWordPos.row = row;
			// this.updateSelectRow();
			this.getContBack().updateSelectRow();
		}
		this.scrollCusorToView();

		var xsize = this.calcTextLen(lines[row].getLineStr().substr(0, col));
		if (!this.keepCacheCursorSingleWordCol) {
			this.cacheCursorSingleWordCol = xsize;
		}
		this.cursorPos.x = xsize * this.charWidth;
		this.cursorPos.y = row * this.lineHeight;
		this.updateCursor();
	}

	getFullShowRows() {
		var height = this.getContentHeight();
		return Math.floor(height / this.lineHeight);
	}

	getShowRows() {
		var height = this.getContentHeight();
		return Math.ceil(height / this.lineHeight);
	}

	updateVerSlbSize() {
		var height = this.getContentHeight();

		var count = (this.totalRow - 1) * this.lineHeight;
		this.verSlbMd.contentSize = height / (height + count) * 100;
		this.verSlbMd.count = count;
	}

	updateHorSlbSize() {
		// var width = this.getContentWidth();
		var width = this.getEditContentWidth();
		var count = this.maxSingleWordWidth * this.charWidth - width + this.getContMain().outWidth;
		if(count < 0) {
			count = 0;
		}
		var widthPx = width / ( width + count) * 100;
		if(isNaN(widthPx)) {
			widthPx = 0;
		}
		// console.info(this.maxSingleWordWidth, widthPx, width, count);
		this.horSlbMd.contentSize = widthPx;
		this.horSlbMd.count = count;
		// console.info(width, count, this.horSlbMd.contentSize, this.horSlbMd.count, this.getLines());
	}

	udpateTotalRow() {
		this.updateLineNoRow();
		this.updateVerSlbSize();

		this.limitVerScroll();
	}

	updateLineNoRow() {
		this.lineNoMd.count = this.totalRow;
	}

	updateCursor() {
		this.getContFill().updateCursor(this.cursorPos);
	}

	calcTextLen(str) {
		return this.comCtl.calcTextLen(str);
	}

	getRenderText(str) {
		var space = this.option.spaceRender;
		var count = this.option.model.option.tabSize;
		return this.comCtl.renderText(str, space, count);
	}

	// formatText(str) {
	// 	var space = this.option.spaceRender;
	// 	var count = this.option.model.option.tabSize;
	// 	return this.comCtl.formatText(str, space, count);
	// }

	calcMaxSingleWordWidth() {
		var lines = this.getLines();
		var rst = 0;
		for (var i = 0; i < lines.length; ++i) {
			rst = Math.max(rst, lines[i].singleWordLength);
		}
		return rst;
	}

	onTextareaChanged(evt) {
		var ele = this.getInput();
		var val = ele.value;
		// this.lines = this.formatText(val);
		this.getContMain().updateText(val);

		var newTotalRow = this.getLines().length;
		if(newTotalRow != this.totalRow) {
			this.totalRow = newTotalRow;
			this.udpateTotalRow();
		}

		var newMaxSingleWordPos = this.getContMain().maxSingleWordWidth;
		// console.info(newMaxSingleWordPos, this.maxSingleWordWidth);
		if(newMaxSingleWordPos != this.maxSingleWordWidth) {
			this.maxSingleWordWidth = newMaxSingleWordPos;
			this.updateHorSlbSize();
			this.limitHorScroll();
		}
		
		if (!this.isIMEStart) {
			this.updateCursorByWordPos();
		}

		this.textInput = val;
	}

	onTextareaPaste(evt) {
		if (!evt.clipboardData) {
			this.lastTextareaPaste = "";
			return;
		}
		var val = evt.clipboardData.getData('text/plain');
		this.lastTextareaPaste = "" + val;
	}

	getContentHeight() {
		var ele = this.$refs.contentBox as HTMLDivElement;
		return ele.clientHeight;
	}

	getContentWidth() {
		var ele = this.$refs.contentBox as HTMLDivElement;
		return ele.clientWidth;
	}

	getEditContentWidth() {
		var ele = this.$refs.editContent as HTMLDivElement;
		return ele.clientWidth;
	}

	limitVerScroll() {
		var rowHeight = (this.totalRow - 1) * this.lineHeight;
		var pos = this.contentPos.y + rowHeight;
		if (pos < 0) {
			var val = this.pxToScrollVal(true, rowHeight);
			var ele = this.$refs.slbVer as IScrollbar;
			var oldValue = ele.getValue();
			if (val == oldValue) {
				this.onVerScrollbarChanging(val);
			} else {
				ele.setValue(val);
			}
		}
	}

	limitHorScroll() {
		var outWidth = this.getContMain().outWidth;
		var width = this.getEditContentWidth();
		var rowWidth = this.maxSingleWordWidth * this.charWidth + outWidth - width;
		var pos = this.contentPos.x + rowWidth;
		if (pos < 0) {
			var val = this.pxToScrollVal(false, rowWidth);
			var ele = this.$refs.slbHor as IScrollbar;
			var oldValue = ele.getValue();
			if (val == oldValue) {
				this.onHorScrollbarChanging(val);
			} else {
				ele.setValue(val);
			}
		}
	}

	scrollCusorToView() {
		var row = this.cursorWordPos.row;
		var col = this.cursorWordPos.col;
		var singleWordCol = this.calcTextLen(this.getRowText(row).substr(0, col));
		this.scrollToRow(row);
		this.scrollToCol(singleWordCol);
	}

	scrollToRow(row) {
		var height = this.getContentHeight();

		var rowHeight = row * this.lineHeight;
		var pos = this.contentPos.y + rowHeight;
		
		if (pos + this.lineHeight * 2 >= height) {
			var val = this.pxToScrollVal(true, rowHeight + this.lineHeight * 2 - height);
			var ele = this.$refs.slbVer as IScrollbar;
			ele.setValue(val);
		} else if (pos < 0) {
			var val = this.pxToScrollVal(true, rowHeight);
			var ele = this.$refs.slbVer as IScrollbar;
			ele.setValue(val);
		}
	}

	scrollToCol(singleWordCol) {
		// var halfOutWidth = this.getContMain().outWidth / 2;
		var halfOutWidth = this.getContMain().outWidth *(3/5);
		var width = this.getEditContentWidth();

		var rowWidth = singleWordCol * this.charWidth;
		var pos = this.contentPos.x + rowWidth;
		
		if (pos >= width - halfOutWidth) {
			var val = this.pxToScrollVal(false, rowWidth - (width - halfOutWidth));
			var ele = this.$refs.slbHor as IScrollbar;
			ele.setValue(val);
		} else if (pos < 0) {
			var val = this.pxToScrollVal(false, rowWidth);
			var ele = this.$refs.slbHor as IScrollbar;
			ele.setValue(val);
		}
	}

	onTextareaCompositionstart(evt) {
		var isSelect = this.isSelectText();
		if(!isSelect && this.needSaveHistory(false, -1)) {
			this.historyCtl.saveHistory();
		}
		if(isSelect) {
			this.removeSelectText();
		}
		// console.info(this.cursorWordPos.row, this.cursorWordPos.col);

		var ele = this.getInput();
		ele.style.height = this.lineHeight + "px";
		ele.scrollTop = this.lineHeight * this.cursorWordPos.row;

		this.isIMEStart = true;
		this.getContFill().setIMEMode(true);
	}

	onTextareaCompositionend(evt) {
		// console.info(evt);
		this.isIMEStart = false;
		this.getContFill().setIMEMode(false);
		// var curPos = this.getCursorTextPos();
		// this.setTextAreaCursorPos(curPos);
		this.onTextareaChanged(null);
		if(evt.data != "") {
			this.lastInsertKeyCode = -1;
			this.isLastKeyRemove = false;
			this.lastChangeString += evt.data;
			// this.historyCtl.saveHistory();
		}
	}

	onTextareaCompositionupdate(evt) {
		var str = evt.data;
		var width = str.length * this.charWidth + 1;
		this.getContFill().updateTextareaWidth(width);
	}

	setTextAreaCursorPos(pos, row = -1) {
		var ele = this.getInput();
		ele.selectionStart = ele.selectionEnd = pos;
		if (row < 0) {
			ele.scrollTop = this.lineHeight * this.cursorWordPos.row;
		} else {
			ele.scrollTop = this.lineHeight * row;
		}
		ele.scrollLeft = 0;
	}

	onTextareaKeydown(evt) {
		return this.keyDownCtl.onKeydown(evt, this);
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
		var newStr = this.getRowText(newRow);
		var newCol = this.calcPosBySingleWordPos(newStr, len);

		this.setTextAreaCursorPos(this.getRow(newRow).pos + newCol, newRow);
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
		var count = this.option.model.option.tabSize;
		return this.comCtl.calcPosBySingleWordPos(str, col, count);
	}

	calcPos(str, px): number {
		return this.comCtl.calcPos(str, px, this.charWidth);
	}

	onContentBoxMouseDownBack(evt) {
		
	}

	onContentBoxMouseDownLineNumber(evt) {
		
	}

	onContentBoxMouseDownMask(evt:MouseEvent) {
		// if(evt.target != this.$refs.editContent) {
		// 	return;
		// }
		// console.info(evt.target);
		// return;
		// right mouse down
		if(evt.button == 2) {
			return;
		}

		this.setEditorFocus();

		// var line = this.getRow(row);
		var row = this.getLines().length - 1;
		var col = this.getRow(row).length;
		// var pos = line.pos + col;
		
		var curRow = this.cursorWordPos.row;
		var curCol = this.cursorWordPos.col;
		
		this.markDownPos(evt, row, col, !evt.shiftKey);

		// this.markDownPos(evt, row, col);

		var ele = this.getInput();
		this.setTextAreaCursorPos(ele.value.length);
		this.updateCursorByWordPos();

		if(evt.shiftKey) {
			this.setSelectRange(false, curRow, curCol, row, col);
		}

		return;
	}

	setEditorFocus() {
		if(this.isFocus) {
			return;
		}

		var ele = this.getInput();
		ele.focus();

		this.isFocus = true;
		this.getContFill().setFocus();
	}

	markDownPos(evt:MouseEvent, row, col, resetSelectRange) {
		this.isDown = true;
		this.mouseDownPos.x = evt.pageX;
		this.mouseDownPos.y = evt.pageY;
		this.downWordPos.row = row;
		this.downWordPos.col = col;

		// var ele = this.getInput();
		// ele.selectionStart = ele.selectionEnd = pos;
		
		this.historyCtl.saveHistory();

		if(resetSelectRange) {
			this.setSelectRange(false, row, col, row, col);
		}
	}

	// setSelectRangeNoSort(_isSelectVer, r1, c1, r2, c2) {
	// 	if (r1 > r2 || (r1 == r2 && c1 > c2)) {
	// 		var tmp = 0;
	// 		tmp = r1; r1 = r2; r2 = tmp;
	// 		tmp = c1; c1 = c2; c2 = tmp;
	// 	}

	// 	this.setSelectRange(_isSelectVer, r1, c1, r2, c2);
	// }

	setSelectRange(_isSelectVer, startRow, startCol, endRow, endCol) {
		this.isSelectVer = _isSelectVer;
		// console.info("aaa");

		this.selectStartPos.row = startRow;
		this.selectStartPos.col = startCol;

		if (startRow > endRow || (startRow == endRow && startCol > endCol)) {
			var tmp = 0;
			tmp = startRow; startRow = endRow; endRow = tmp;
			tmp = startCol; startCol = endCol; endCol = tmp;
		}

		this.selectWordRange.startRow = startRow;
		this.selectWordRange.startCol = startCol;
		this.selectWordRange.endRow = endRow;
		this.selectWordRange.endCol = endCol;
		// console.info("aaa");
		this.getContBack().updateSelectRange();
	}

	getElementPagePos(ele:HTMLElement) {
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
	onDocMousemove(evt:MouseEvent) {
		if(!this.isDown) {
			return;
		}
		if(this.mouseDownPos.x == evt.pageX && this.mouseDownPos.y == evt.pageY) {
			return;
		}
		// console.info("move");

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

		var line = this.getRow(row);
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
	}

	getCursorPosByTablePos(row, col) {
		if(row < 0 || row >= this.totalRow) {
			return 0;
		}

		return this.getRow(row).pos + col;
	}

	anoOnDocMouseup = e=>this.onDocMouseup(e);
	onDocMouseup(evt) {
		this.isDown = false;
	}

	onMousedown(evt) {
		evt.preventDefault && evt.preventDefault();
	}

	replaceText(str:string, pos:number, oldLength:number) {
		var ele = this.getInput();
		var oldStr = ele.value;
		var newStr = oldStr.substr(0, pos) + str + oldStr.substr(pos+oldLength);
		ele.value = newStr;
		this.setTextAreaCursorPos(pos + str.length);
		this.updateCursorByWordPos();
		this.onTextareaChanged(null);
		// console.info("111", newStr, str, pos, oldLength);
	}

	insertText(str) {
		var ele = this.getInput();

		var startPos = ele.selectionStart;
		var endPos = ele.selectionEnd;
		var nowPos = startPos;
		var tmp = ele.value;

		ele.value = tmp.substring(0, startPos) + str + tmp.substr(endPos);
		nowPos += str.length;
		this.setTextAreaCursorPos(nowPos);
		this.updateCursorByWordPos();
	}

	isTab(keyCode) {
		return this.checkInsert.isTab(keyCode);
	}

	isChangeHistoryChar(keyCode) {
		return this.checkInsert.isChangeHistoryChar(keyCode);
	}

	needSaveHistory(isRemove, keyCode) {
		// var isRemove = this.editor.checkInsert.isRemove(keyCode);
		if(this.lastChangeString == "" && this.lastRemoveSelectString == "") {
			return false;
		}

		if(this.isTab(this.lastInsertKeyCode)) {
			return true;
		}

		var isLastRemove = this.checkInsert.isRemove(this.lastInsertKeyCode);
		if(!isRemove && !isLastRemove) {
			if(this.isChangeHistoryChar(keyCode)) {
				return true;
			}
			return false;
		}
		if(!isRemove) {
			return true;
		}

		return (this.lastInsertKeyCode != keyCode);
	}

	isSelectText() {
		var sr = this.selectWordRange;
		return (sr.startRow != sr.endRow || sr.startCol != sr.endCol);
	}

	removeSelectText() {
		if(!this.isSelectText()) {
			return;
		}
		if(this.lastRemoveSelectString != "") {
			this.historyCtl.saveHistory();
		}
		// return;

		var sr = this.selectWordRange;
		var lines = this.getLines();
		var len = 0;
		var str = "";
		for(var i = sr.startRow; i <= sr.endRow; ++i) {
			var strLine = lines[i].getLineStr();
			if(i == sr.startRow && i == sr.endRow) {
				len = sr.endCol - sr.startCol;
				str += strLine.substr(sr.startCol, len);
			} else if(i == sr.startRow) {
				len += lines[i].length - sr.startCol + 1;
				str += strLine.substr(sr.startCol) + "\n";
			} else if(i == sr.endRow) {
				len += sr.endCol;
				str += strLine.substr(0, sr.endCol);
			} else {
				len += lines[i].length + 1;
				str += strLine + "\n";
			}
		}

		var pos = lines[sr.startRow].pos + sr.startCol;
		
		this.lastRemoveSelectString = str;
		this.lastRemoveSelectStringPos = pos;
		// console.info(pos, len, JSON.stringify(sr));
		this.replaceText("", pos, len);

		var row = this.cursorWordPos.row;
		var col = this.cursorWordPos.col;
		this.setSelectRange(false, row, col, row, col);
	}

	onMouseup(evt) {
		
	}

	pxToScrollVal(isVer, pxVal) {
		return pxVal;

		if (isVer) {
			if (this.totalRow <= 1) {
				return 0;
			}
			var textHeight = (this.totalRow - 1) * this.lineHeight;
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
		
		var scrollVal = this.pxToScrollVal(true, 125) * (val > 0 ? -1 : 1);

		if (evt.shiftKey) {
			var ele = this.$refs.slbHor as IScrollbar;
			ele.setValue(ele.getValue() + scrollVal);
			return;
		}

		var ele = this.$refs.slbVer as IScrollbar;
		ele.setValue(ele.getValue() + scrollVal);
	}
}
