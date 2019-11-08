import SimpleMonacoEditor from '../SimpleMonacoEditorTs';

export default class EditorKeyDownCtl {
	editor:SimpleMonacoEditor = null;
	evt: KeyboardEvent = null;

	prevent = true;
	scrollRow = 1;
	startPos = 0;
	totalStrCount = 0;

	mapDownCtl:Record<number, Function> = {};

	constructor() {
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

	onKeydown(_evt:KeyboardEvent, _editor:SimpleMonacoEditor) {
		this.evt = _evt;
		this.editor = _editor;

		var ele = this.editor.getInput();
		// console.info("keydown", ele.selectionStart, ele.selectionEnd);
		// console.info("keydown", evt.keyCode, evt.key, evt);

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

		// ctrl
		if (this.evt.ctrlKey) {
			switch (this.evt.keyCode) {
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

			this.evt.preventDefault && this.evt.preventDefault();
			return;
		}

		var keyCode = this.evt.keyCode;

		var isInsert = this.editor.checkIsInsert.isInsert(keyCode);
		// if(!isInsert) {
		// 	return;
		// }

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