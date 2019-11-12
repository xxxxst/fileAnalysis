import SimpleMonacoEditor from '../SimpleMonacoEditorTs';

export default class EditorKeyDownCtl {
	editor:SimpleMonacoEditor = null;
	evt: KeyboardEvent = null;

	prevent = true;
	scrollRow = 1;
	startPos = 0;
	totalStrCount = 0;

	mapCtrlDownCtl:Record<number, Function> = {};
	mapDownCtl:Record<number, Function> = {};

	constructor() {
		this.mapCtrlDownCtl = {
			90: this.onCtrlDownZ,
			89: this.onCtrlDownY,
			65: this.onCtrlDownA,
			67: this.onCtrlDownC,
			86: this.onCtrlDownV,
			83: this.onCtrlDownS,
		};
		this.mapDownCtl = {
			8 : this.onDownBackspace,
			9 : this.onDownTab,
			13: this.onDownEnter,
			37: this.onDownLeft,
			39: this.onDownRight,
			36: this.onDownHome,
			35: this.onDownEnd,
			38: this.onDownUp,
			40: this.onDownDown,
			33: this.onDownPageUp,
			34: this.onDownPageDown,
		}
	}

	isSelectText() {
		var sr = this.editor.selectWordRange;
		return (sr.startRow != sr.endRow || sr.startCol != sr.endCol);
	}

	// isLastDownBackspace() {
	// 	return this.editor.checkInsert.isBackspace(this.editor.lastInsertKeyCode);
	// }

	// isLastDownDelete() {
	// 	return this.editor.checkInsert.isDelete(this.editor.lastInsertKeyCode);
	// }

	onKeydown(_evt:KeyboardEvent, _editor:SimpleMonacoEditor) {
		this.evt = _evt;
		this.editor = _editor;

		var ele = this.editor.getInput();
		// console.info("keydown", ele.selectionStart, ele.selectionEnd);
		// console.info("keydown", this.evt.keyCode, this.evt.key, this.evt);

		if (this.editor.isIMEStart) {
			return;
		}

		// readonly
		if (this.editor.option.readOnly) {
			this.evt.preventDefault && this.evt.preventDefault();
			return;
		}

		// alt
		if(this.evt.altKey) {
			this.evt.preventDefault && this.evt.preventDefault();
			return;
		}

		var keyCode = this.evt.keyCode;

		// ctrl
		if (this.evt.ctrlKey) {
			if(keyCode in this.mapCtrlDownCtl) {
				this.mapCtrlDownCtl[keyCode].call(this);
			}

			this.evt.preventDefault && this.evt.preventDefault();
			return;
		}

		// var isInsert = this.editor.checkInsert.isInsert(keyCode);
		// if(!isInsert) {
		// 	return;
		// }

		var isRemove = this.editor.checkInsert.isRemove(keyCode);

		var ch = this.editor.checkInsert.getInsertChar(keyCode, this.evt.key, this.evt.shiftKey);
		if(!isRemove && ch == "") {
			if(keyCode in this.mapDownCtl) {
				this.mapDownCtl[keyCode].call(this);
			}
			// this.evt.preventDefault && this.evt.preventDefault();
			return;
		}

		var isSelect = this.isSelectText();

		if(isSelect) {
			this.removeSelectText();
			if(isRemove) {
				this.editor.lastInsertKeyCode = keyCode;
				this.editor.isLastKeyRemove = isRemove;
				this.editor.cursorHold = true;
				this.evt.preventDefault && this.evt.preventDefault();
				return;
			} else {
				this.editor.lastChangeString += ch;
			}
		} else {
			this.saveHistory(isRemove, ch, keyCode);
		}

		// if(this.isSelectText()) {

		// }

		// save history
		this.editor.lastInsertKeyCode = keyCode;
		this.editor.isLastKeyRemove = isRemove;

		// var startPos = ele.selectionStart;

		// enter
		// var gap = this.evt.keyCode == 13 ? 1 : 0;
		// var row = this.cursorWordPos.row + gap;

		this.startPos = ele.selectionStart;
		this.totalStrCount = ele.value.length;
		this.prevent = true;
		this.scrollRow = this.editor.cursorWordPos.row;

		// var scrollRow = this.editor.cursorWordPos.row;

		if(keyCode in this.mapDownCtl) {
			this.mapDownCtl[keyCode].call(this);
		} else {
			this.onDownOrther();
		}

		this.editor.scrollToRow(this.scrollRow);

		if (this.prevent) {
			this.evt.preventDefault && this.evt.preventDefault();
		}
	}

	private removeSelectText() {
		// if(!this.isSelectText()) {
		// 	return;
		// }
		// return;

		var sr = this.editor.selectWordRange;
		var lines = this.editor.getLines();
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
		
		this.editor.lastRemoveSelectString = str;
		this.editor.lastRemoveSelectStringPos = pos;
		// console.info(pos, len, JSON.stringify(sr));
		this.editor.replaceText("", pos, len);

		this.editor.setSelectRange(false, 0, 0, 0, 0);
	}

	private isChangeHistoryChar(keyCode) {
		return this.editor.checkInsert.isChangeHistoryChar(keyCode);
	}

	private isTab(keyCode) {
		return this.editor.checkInsert.isTab(keyCode);
	}

	private isEnter(keyCode) {
		return this.editor.checkInsert.isEnter(keyCode);
	}

	private needSaveHistory(isRemove, keyCode) {
		// var isRemove = this.editor.checkInsert.isRemove(keyCode);
		if(this.editor.lastChangeString == "" && this.editor.lastRemoveSelectString == "") {
			return false;
		}

		if(this.isTab(this.editor.lastInsertKeyCode)) {
			return true;
		}

		var isLastRemove = this.editor.checkInsert.isRemove(this.editor.lastInsertKeyCode);
		if(!isRemove && !isLastRemove) {
			if(this.isChangeHistoryChar(keyCode)) {
				return true;
			}
			return false;
		}
		if(!isRemove) {
			return true;
		}

		return (this.editor.lastInsertKeyCode != keyCode);
	}

	private saveHistory(isRemove, chInsert, keyCode) {
		if(this.needSaveHistory(isRemove, keyCode)) {
			this.editor.historyCtl.saveHistory();
		}

		// console.info("111", isRemove, this.editor.lastChangeString);

		if(isRemove) {
			var isDel = this.editor.checkInsert.isDelete(keyCode);
			var delChar = this.editor.getCursorText(isDel);
			if(isDel) {
				this.editor.lastChangeString += delChar;
			} else {
				this.editor.lastChangeString = delChar + this.editor.lastChangeString;
			}
		} else {
			this.editor.lastChangeString += chInsert;
		}
	}

	private onCtrlDownZ() {
		this.editor.historyCtl.ctrlZ();
	}

	private onCtrlDownY() {
		this.editor.historyCtl.ctrlY();
	}

	private onCtrlDownA() {
		var lines = this.editor.getLines();
		this.editor.setSelectRange(false, 0, 0, lines.length - 1, lines[lines.length - 1].length);
	}

	private onCtrlDownC() {
		
	}

	private onCtrlDownV() {
		
	}

	private onCtrlDownS() {
		
	}

	private onDownTab() {
		this.editor.cursorHold = true;
		this.editor.insertText("\t");
		this.editor.onTextareaChanged(null);
	}

	private onDownEnter() {
		this.prevent = false;
		this.scrollRow += 1;
	}

	private onDownLeft() {
		if (this.startPos > 0) {
			this.editor.cursorHold = true;
			// ele.selectionStart = ele.selectionEnd = startPos - 1;
			this.editor.setTextAreaCursorPos(this.startPos - 1);
			this.editor.updateCursorByWordPos();
		} else {
			this.editor.cursorHold = false;
		}
	}

	private onDownRight() {
		if (this.startPos < this.totalStrCount) {
			this.editor.cursorHold = true;
			this.editor.setTextAreaCursorPos(this.startPos + 1);
			this.editor.updateCursorByWordPos();
		} else {
			this.editor.cursorHold = false;
		}
	}

	private onDownHome() {
		var col = this.editor.cursorWordPos.col;
		if (col != 0) {
			this.editor.cursorHold = true;
			var row = this.editor.cursorWordPos.row;
			this.editor.setTextAreaCursorPos(this.editor.getRow(row).pos);
			this.editor.updateCursorByWordPos();
		} else {
			this.editor.cursorHold = false;
		}
	}

	private onDownEnd() {
		var row = this.editor.cursorWordPos.row;
		var col = this.editor.cursorWordPos.col;
		// console.info(col, this.lines[row].length);
		if (col < this.editor.getRow(row).length) {
			this.editor.cursorHold = true;
			var row = this.editor.cursorWordPos.row;
			// ele.selectionStart = ele.selectionEnd = this.lines[row].pos + this.lines[row].length;
			this.editor.setTextAreaCursorPos(this.editor.getRow(row).pos + this.editor.getRow(row).length);
			this.editor.updateCursorByWordPos();
		} else {
			this.editor.cursorHold = false;
		}
	}

	private onDownUp() {
		this.scrollRow = this.editor.jumpToRow(this.editor.cursorWordPos.row - 1);
	}

	private onDownDown() {
		this.scrollRow = this.editor.jumpToRow(this.editor.cursorWordPos.row + 1);
	}

	private onDownPageUp() {
		var rows = this.editor.getFullShowRows() - 1;
		this.scrollRow = this.editor.jumpToRow(this.editor.cursorWordPos.row - rows);
	}

	private onDownPageDown() {
		var rows = this.editor.getFullShowRows() - 1;
		this.scrollRow = this.editor.jumpToRow(this.editor.cursorWordPos.row + rows);
	}

	private onDownBackspace() {
		this.editor.cursorHold = true;
		this.prevent = false;
		if (this.scrollRow > 0 && this.editor.cursorWordPos.col == 0) {
			this.scrollRow -= 1;
		}
	}

	private onDownOrther() {
		this.editor.cursorHold = true;
		this.prevent = false;
	}

}