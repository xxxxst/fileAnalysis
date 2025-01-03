import SimpleMonacoEditor from '@/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';

// export enum EditType {
// 	Insert, Remove
// }

export class HistoryRepaceItem {
	pos = 0;
	text = "";
	replaceText = "";
}

export class HistoryItem {
	// type:EditType = EditType.Insert;
	data: HistoryRepaceItem[] = [];
}

export default class HistoryCtl {
	editor: SimpleMonacoEditor = null;
	data: HistoryItem[] = [];
	nextData: HistoryItem[] = [];

	nowItem = new HistoryItem();
	nowReplaceItem = new HistoryRepaceItem();

	push(item:HistoryItem) {
		this.data.push(item);
	}

	pop() {
		return this.data.pop();
	}

	isLastDownBackspace() {
		return this.editor.checkInsert.isBackspace(this.editor.lastInsertKeyCode);
	}

	isLastDownDelete() {
		return this.editor.checkInsert.isDelete(this.editor.lastInsertKeyCode);
	}

	saveHistory() {
		if(!this.isChangedText()) {
			return;
		}

		this.nextData = [];

		var str = this.editor.lastChangeString;
		var strSlt = this.editor.lastRemoveSelectString;
		var pos = this.editor.getCursorTextPos();
		// console.info("bbb", pos, this.editor.cursorWordPos.row, this.editor.cursorWordPos.col);

		if(strSlt != "") {
			this.replace(strSlt, this.editor.lastRemoveSelectStringPos, "", false);
			this.editor.lastRemoveSelectStringPos = -1;
			this.editor.lastRemoveSelectString = "";
		}

		if(this.isLastDownBackspace()) {
			this.replace(str, pos, "", false);
		} else if(this.isLastDownDelete()) {
			this.replace(str, pos, "", false);
		} else {
			this.replace("", pos - str.length, str, false);
		}

		this.data.push(this.nowItem);
		this.nowItem = new HistoryItem();

		this.editor.lastChangeString = "";
		this.editor.isLastKeyRemove = false;
		this.editor.lastInsertKeyCode = -1;
	}

	replace(replaceStr:string, start:number, newVal:string, isNewOperate) {
		var it = new HistoryRepaceItem();
		it.pos = start;
		// it.replaceText = changeStr.substr(start, length);
		it.replaceText = replaceStr;
		it.text = newVal;

		if(isNewOperate && this.nowItem.data.length > 0) {
			this.data.push(this.nowItem);
			this.nextData = [];
			this.nowItem = new HistoryItem();
		}

		this.nowItem.data.push(it);
	}

	isChangedText() {
		var str = this.editor.lastChangeString;
		var strSlt = this.editor.lastRemoveSelectString;
		return (str != "" || strSlt != "");
	}

	ctrlZ() {
		if(this.isChangedText()) {
			this.saveHistory();
		}
		// console.info("aaa", JSON.stringify(this.data[0]));

		if(this.data.length <= 0) {
			return;
		}

		var rootItem = this.data.pop();
		this.nextData.push(rootItem);

		for(var i = rootItem.data.length - 1; i >= 0; --i) {
			var it = rootItem.data[i];
			this.editor.replaceText(it.replaceText, it.pos, it.text.length);
		}
	}

	ctrlY() {
		if(this.nextData.length <= 0) {
			return;
		}

		var rootItem = this.nextData.pop();
		this.data.push(rootItem);

		for(var i = 0; i < rootItem.data.length; ++i) {
			var it = rootItem.data[i];
			this.editor.replaceText(it.text, it.pos, it.replaceText.length);
		}
	}

	clear() {
		this.data = [];
		this.nextData = [];
		this.nowItem = new HistoryItem();
	}
}