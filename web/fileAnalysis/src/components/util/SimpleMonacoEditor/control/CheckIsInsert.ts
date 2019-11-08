
export default class CheckIsInsert{
	cacheArr = [
		[65, 90 , "a-z"		],
		[48, 57 , "0-9"		],
		[96, 105, "keypad 0-9"	],
	];
	cacheMap = {
		32	: "space",
		9	: "tab",
		13	: "enter",
		8	: "backspace",
		46	: "delete",
		192	: "`",
		219	: "[",
		221	: "]",
		186	: ";",
		222	: "'",
		220	: "\\",
		188	: ",",
		190	: ".",
		191	: "/",
		110	: "keypad .",
		111	: "keypad /",
		106	: "keypad *",
		109	: "keypad -",
		107	: "keypad +",
	}

	isInsert(keyCode) {
		for (var i = 0; i < this.cacheArr.length; ++i) {
			var min = this.cacheArr[i][0];
			var max = this.cacheArr[i][1];
			if (keyCode >= min && keyCode <= max) {
				return true;
			}
		}
		if(keyCode in this.cacheMap) {
			return true;
		}

		return false;
	}
}