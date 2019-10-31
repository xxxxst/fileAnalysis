
export class TextItem {
	value = "";
	renderVlaue = "";
	style = "";
	pos = 0;
	length = 0;
	singleWordLength = 0;
}

export class TextLine {
	data: TextItem[] = [];
	row = 0;
	pos = 0;
	length = 0;
	singleWordLength = 0;

	getLineStr() {
		var rst = "";
		for(var i = 0; i < this.data.length; ++i) {
			rst += this.data[i].value;
		}

		return rst;
	}
}
