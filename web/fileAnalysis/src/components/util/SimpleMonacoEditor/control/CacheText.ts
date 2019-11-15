
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

	splitLength = 1024;

	setValue(text:string) {
		text = text.replace(/\r\n/g, "\n");
		var len = text.length;
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
				var str = arr[i].substr(i, len);
				var md = new CacheTextItem();
				md.pos = pos;
				md.val = str;
				rowData.data.push(md);
				pos += len;
			}
			pos += 1;
			this.data.push(rowData);
		}
		console.info(this.data);
	}

	findRangeByPos(pos:number) {

	}

	findRowByPos(pos:number) {
		var start = 0;
		var end = this.data.length - 1;
		var mid = Math.floor((start + end) / 2);
		while(end >= start) {
			if(pos >= this.data[mid].pos) {
				start = mid+1;
			} else {
				end = mid-1;
			}
			mid = Math.floor((start + end) / 2);
		}
		return mid;
	}

	findColByPos(row:number, pos:number) {
		var arr = this.data[row].data;
		var start = 0;
		var end = arr.length - 1;
		var mid = Math.floor((start + end) / 2);
		while(end >= start) {
			if(pos >= arr[mid].pos) {
				start = mid+1;
			} else {
				end = mid-1;
			}
			mid = Math.floor((start + end) / 2);
		}
		return mid;
	}

	substr(pos:number, len:number) {
		if(len < 0) {

		}
	}
}