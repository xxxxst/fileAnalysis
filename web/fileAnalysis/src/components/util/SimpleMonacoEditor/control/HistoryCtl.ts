
// export enum EditType {
// 	Insert, Remove
// }

export class HistorySubItem {
	pos = 0;
	text = "";
	replaceText = "";
}

export class HistoryItem {
	// type:EditType = EditType.Insert;
	data: HistorySubItem[];
}

export default class HistoryCtl {
	data: HistoryItem[] = [];
	nextData: HistoryItem[] = [];

	nowItem: HistoryItem = new HistoryItem();

	push(item:HistoryItem) {
		this.data.push(item);
	}

	pop() {
		return this.data.pop();
	}

	replace(str:string, start:number, length:number, newVal:string, isNewOperate) {
		var it = new HistorySubItem();
		it.pos = start;
		it.replaceText = str.substr(start, length);
		it.text = newVal;

		if(isNewOperate) {
			this.data.push(this.nowItem);
			this.nextData = [];
			this.nowItem = new HistoryItem();
		}

		this.nowItem.data.push(it);
	}

	ctrlZ(str) {
		if(this.data.length <= 0) {
			return;
		}
	}
}