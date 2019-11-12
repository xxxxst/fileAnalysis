
export default class CheckInsert {
	cacheArr = [
		[65, 90 , "a-z"		],
		[48, 57 , "0-9"		],
		[96, 105, "keypad 0-9"	],
	];
	cacheMap = {
		32	: "space",
		9	: "tab",
		13	: "enter",
		// 8	: "backspace",
		// 46	: "delete",
		187	: "-",
		189	: "+",
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

	mpaIsRemoveChar = {
		8	: "backspace",
		46	: "delete",
	};

	mapChangeHistoryChar = {
		9	: "tab",
		13	: "enter",
		// 8	: "backspace",
		// 46	: "delete",
	};

	isDelete(keyCode) {
		return keyCode == 46;
	}

	isBackspace(keyCode) {
		return keyCode == 8;
	}

	isTab(keyCode) {
		return keyCode == 9;
	}

	isEnter(keyCode) {
		return keyCode == 13;
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

	isRemove(keyCode) {
		return (keyCode in this.mpaIsRemoveChar);
	}

	isChangeHistoryChar(keyCode) {
		return (keyCode in this.mapChangeHistoryChar);
	}

	getInsertChar(keyCode, key, isShiftDown) {
		for (var i = 0; i < this.cacheArr.length; ++i) {
			var min = this.cacheArr[i][0];
			var max = this.cacheArr[i][1];
			if (keyCode >= min && keyCode <= max) {
				return key;
			}
		}
		// tab
		if(keyCode == 9) {
			return isShiftDown ? "" : "\t";
		}
		// enter
		if(keyCode == 13) {
			return isShiftDown ? "" : "\n";
		}
		if(keyCode in this.cacheMap) {
			return key;
		}
		return "";
	}
}