
class CacheTextItem {
	pos = 0;
	val = "";
}

class CacheTextRow {
	pos = 0;
	data: CacheTextItem[] = [];
}

export default class CacheText {
	data : CacheTextRow[] = [];
	textLength = 0;

	splitLength = 5;

	setValue(text:string) {
		text = text.replace(/\r\n/g, "\n");
		// var len = text.length;
		this.textLength = text.length;
		var arr = text.split("\n");
		var pos = 0;
		for(var i = 0; i < arr.length; ++i) {
			var rowData = new CacheTextRow();
			rowData.pos = pos;
			for(var j = 0; j < arr[i].length; j += this.splitLength) {
				var len = this.splitLength;
				if(j + len > arr[i].length ) {
					len = arr[i].length - j;
				}
				var str = arr[i].substr(j, len);
				var md = new CacheTextItem();
				md.pos = pos;
				md.val = str;
				rowData.data.push(md);
				pos += len;
			}
			if(rowData.data.length == 0) {
				var md = new CacheTextItem();
				md.pos = pos;
				md.val = "";
				rowData.data.push(md);
			}
			if(i != arr.length - 1) {
				rowData.data[rowData.data.length-1].val += "\n";
				pos += 1;
			}
			this.data.push(rowData);
		}
		// console.info(this.data, this);
	}

	getValue() {
		return this.substr(0);
	}

	private findRangeByPos(pos:number) {
		var range = { row: -1, col: -1 };
		range.row = this.findRowByPos(pos);
		if(range.row < 0) { return range; }

		range.col = this.findColByPos(range.row, pos);
		return range;
	}

	private findRowByPos(pos:number) {
		if(pos < 0 || pos >= this.textLength) {
			return -1;
		}

		var start = 0;
		var end = this.data.length - 1;
		var mid = -1;
		while(end >= start) {
			// var newMid = Math.floor((start + end) / 2);
			// pos == 42 && console.info("aaa", pos, start, end, mid, newMid);
			// if(newMid == mid) {
			// 	return mid;
			// }
			// mid = newMid;
			mid = Math.ceil((start + end) / 2);

			// if(pos == 42) {
			// 	console.info("aaa", pos, this.data[mid].pos, start, end, mid);
			// }

			if (pos == this.data[mid].pos) {
				return mid;
			} else if (pos > this.data[mid].pos) {
				if(start == mid) {
					return mid;
				}
				start = mid;
			} else{
				end = mid - 1;
			}

		}
		
		return mid;
	}

	private findColByPos(row:number, pos:number) {
		// if(pos < 0 || pos >= this.textLength || row < 0 || row >= this.data.length) {
		// 	return -1;
		// }
		
		var arr = this.data[row].data;
		// if(arr.length <= 0) {
		// 	return - 1;
		// }

		var start = 0;
		var end = arr.length - 1;
		var mid = -1;
		while(end >= start) {
			// var newMid = Math.floor((start + end) / 2);
			// if(newMid == mid) {
			// 	return mid;
			// }
			// mid = newMid;
			mid = Math.ceil((start + end) / 2);

			if(pos == arr[mid].pos) {
				return mid;
			} else if(pos > arr[mid].pos) {
				if(start == mid) {
					return mid;
				}
				start = mid;
			} else {
				end = mid - 1;
			}
		}
		
		return mid;
	}

	private isOneCell(rc1, rc2) {
		return (rc1.row == rc2.row && rc1.col == rc2.col)
	}

	private getCell(rc) {
		return this.data[rc.row].data[rc.col];
	}

	private getLastRow() {
		if(this.data.length < 0) {
			return null;
		}
		return this.data[this.data.length - 1];
	}

	private getLastCell() {
		var row = this.getLastRow();
		if(!row || row.data.length < 0) {
			return null;
		}

		return row.data[row.data.length - 1];
	}

	// insert(str:string, pos:number) {
	// 	if(pos < 0 || pos > this.textLength) {
	// 		return;
	// 	}
	// 	str = str.replace(/\r\n/g, "\n");
	// 	var arr = str.split("\n");
	// 	if(pos == this.textLength) {
	// 		if(this.data.length < 0) {
	// 			var row = new CacheTextRow();
	// 			row.pos = 0;
	// 		}
	// 	}
	// }

	// remove(pos:number, len:number) {
	// 	if(len <= 0 || pos < 0 || pos >= this.textLength) {
	// 		return;
	// 	}
	// }

	substr(pos:number, len:number = -1) {
		if(pos < 0 || pos >= this.textLength) {
			return "";
		}

		if(len < 0 || pos + len > this.textLength) {
			len = this.textLength - pos;
		}

		var rc1 = this.findRangeByPos(pos);
		var rc2 = this.findRangeByPos(pos + len-1);
		// console.info("aaa", rc1, rc2);

		if(rc1.row < 0 || rc2.row < 0) {
			return "";
		}

		var rst = "";
		for(var r = rc1.row; r <= rc2.row; ++r) {
			var row = this.data[r];
			var colStart = 0;
			var colCount = row.data.length;
			if (rc1.row == rc2.row) {
				colCount = rc2.col - rc1.col + 1;
			} else if (r == rc1.row) {
				colStart = rc1.col;
				colCount = row.data.length - rc1.col;
			} else if (r == rc2.row) {
				colCount = rc2.col + 1;
			}
			for(var c = colStart; c < colCount; ++c) {
				var cell = row.data[c];
				var strPos = 0;
				var strLen = cell.val.length;
				if (rc1.row == rc2.row && rc1.col == rc2.col) {
					strPos = pos - cell.pos;
					strLen = len;
				} if (r == rc1.row && c == rc1.col) {
					strPos = pos - cell.pos;
				} else if (r == rc2.row && c == rc2.col) {
					strLen = pos + len - cell.pos;
				}
				rst += cell.val.substr(strPos, strLen);
			}
		}
		return rst;
	}
}
