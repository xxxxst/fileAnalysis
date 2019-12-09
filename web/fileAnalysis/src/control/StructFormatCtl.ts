import { FileStruct, FileStructAttr, AddressMd } from 'src/model/FileStruct';

export default class StructFormatCtl {
	static regHead = /^\s*\[\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\|\s*(\S*)\s*\]\s*$/;
	static regAttr1 = /^\s*(\S+)\s+(\S+)\s*=\s*(\S*)\s*;\s*\/\/\s*(\S*)\s*$/;
	static regAttr2 = /^\s*(\S+)\s+(\S+)\s*;\s*\/\/\s*(\S*)\s*$/;
	static regAttrType1 = /^([a-zA-Z_$][a-zA-Z_$0-9]*)\[(\s*[0-9]+\s*)\]$/;
	static regAttrType2 = /^([a-zA-Z_$][a-zA-Z_$0-9]*)$/;
	
	static textToFileStruct(text:string) {
		var arr = text.replace(/\r\n/g, "\n").split("\n");
		var rst = new FileStruct();
		for(var i = 0; i < arr.length; ++i) {
			// head
			var tmp = this.regHead.exec(arr[i]);
			if(tmp) {
				rst.name = tmp[1];
				rst.desc = tmp[2];
				continue;
			}

			// attr
			// int key = value; //desc
			tmp = this.regAttr1.exec(arr[i]);
			if(tmp) {
				var type = this.textToStructAttrType(tmp[1]);
				if(!type) {
					continue;
				}
				var attr = new FileStructAttr();
				this.setStructAttr(attr, type[0], type[1], tmp[2], tmp[3], tmp[4]);
				rst.attrs.push(attr);
				continue;
			}

			// attr
			// int key ; //desc
			tmp = this.regAttr2.exec(arr[i]);
			if(tmp) {
				var type = this.textToStructAttrType(tmp[1]);
				if(!type) {
					continue;
				}
				var attr = new FileStructAttr();
				this.setStructAttr(attr, type[0], type[1], tmp[2], "", tmp[3]);
				rst.attrs.push(attr);
				continue;
			}

		}

		if(rst.name == "") {
			return null;
		}
		rst.textCache = text;
		rst.editCache = text;
		return rst;
	}

	static setStructAttr(attr, type, len, name, defValue, desc) {
		attr.type = type;
		attr.arrayLength = len;
		attr.name = name;
		attr.defaultValue = defValue;
		attr.desc = desc;
	}

	static textToStructAttrType(text:string): any {
		var tmp = this.regAttrType1.exec(text);
		if(tmp) {
			return [tmp[1], parseInt(tmp[2])];
		}

		tmp = this.regAttrType2.exec(text);
		if(tmp) {
			return [tmp[1], -1];
		}

		return null;
	}

	static 	textToAddress(text:string): AddressMd[] {
		var rst = [];
		var arr = text.replace(/\r\n/g, "\n").split("\n");
		for(var i = 0; i < arr.length; ++i) {
			var idx = arr[i].indexOf("	");
			if(idx < 0) {
				continue;
			}
			var tmp = new AddressMd();
			tmp.name = arr[i].substr(0, idx);
			tmp.address = arr[i].substr(idx+1);

			rst.push(tmp);
		}

		return rst;
	}

}