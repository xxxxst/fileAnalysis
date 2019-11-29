
export class FileStructAttr {
	name = "";
	desc = "";
	type = "";
	arrayLength = -1;
	defaultValue = "";
}

export class FileStruct {
	name = "";
	desc = "";
	// address = "";
	textCache = "";
	attrs: FileStructAttr[] = [];

	_editTextCache = "";
	_saved = true;
}

// export class RootFileStruct {
// 	name = "";
// 	address = "";

// 	// target: FileStruct = null;
// }

export class FileStructInfo {
	name = "";
	suffix = "";
	// lstData: FileStruct[] = [];
	// routes: RootFileStruct[] = [];
	structs: FileStruct[] = [];
	address = "";
}

export class AddressAttrMd {
	len = 0;
}

export class AddressMd {
	name = "";
	address = "";

	realAddr = -1;
	len = 0;

	attrs: AddressAttrMd[] = [];
}