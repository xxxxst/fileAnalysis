import { TextLine, TextItem } from 'src/components/util/SimpleMonacoEditor/model/TextLine';

export default class ComEditCtl {

	private getTabStr(ch:string, count:number) {
		var rst = "";
		for(var i = 0; i < count; ++i) {
			rst += ch;
		}
		return rst;
	}

	// render orgin text
	// space	=> 1 space
	// tab		=> 1-? space
	// &<>		=> &amp;@lt;@gt;
	renderText(str:string, strSpace:string, tabCount:number) {
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
				var count = tabCount - (len % tabCount);
				len += count;
				rst += this.getTabStr(strSpace, count);
				continue;
			}
			switch (ch) {
				case "&": rst += "&amp;"; break;
				case "<": rst += "&lt;"; break;
				case ">": rst += "&gt;"; break;
				case " ": rst += strSpace; break;
				default: rst += ch; break;
			}
			len += 1;
		}
		// str = str.replace(/"/g, "&");

		return rst;
	}

	// calc "on line" text length
	//    tab word + 1-4
	// single word + 1
	//   wide word + 2
	calcTextLen(str:string) {
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

	formatText(str:string, strSpace:string, tabCount:number) {
		var arr = str.replace(/\r\n/g, "\n").split("\n");
		var rst = [];
		var pos = 0;
		for (var i = 0; i < arr.length; ++i) {
			var line = new TextLine();
			line.pos = pos + i;

			var md = new TextItem();
			md.value = arr[i];
			md.renderVlaue = this.renderText(arr[i], strSpace, tabCount);
			md.singleWordLength = this.calcTextLen(md.value);
			line.data.push(md);

			line.length = md.value.length;
			line.singleWordLength += md.singleWordLength;

			rst.push(line);

			pos += arr[i].length;
		}

		return rst;
	}

	// calc pos by word pos
	//    tab word + 1-4
	// single word + 1
	//   wide word + 2
	calcPosBySingleWordPos(str:string, col:number, tabCount:number) {
		// var len = this.calcTextLen(str);
		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			var width = 0;
			if (str.charAt(i) == '\t') {
				width = tabCount - (len % tabCount);
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

	// calc word pos by pixel pos
	//        px	x pixel pos
	// charWidth	char pixel width
	calcPos(str:string, px:number, charWidth:number): number {
		var totalPx = 0;
		// var rst = 0;

		var len = 0;
		for (var i = 0; i < str.length; ++i) {
			var no = str.charCodeAt(i);
			var ch = str.charAt(i);
			var chw = charWidth;
			if (no > 0xff) {
				len += 2;
				chw = charWidth * 2;
			} else if (ch == '\t') {
				var tmp = 4 - (len % 4);
				len += tmp;
				chw = tmp * charWidth;
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

}