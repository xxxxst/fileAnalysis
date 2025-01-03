import SimpleMonacoEditor from '@/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';

export class TextMdOption {
	tabSize? = 4;			//unused
	insertSpaces? = false;	//unused
}

export class TextMd {
	editor: SimpleMonacoEditor = null;
	option = new TextMdOption();

	// val = "";
	// onDidChangeContentCb = null;
	history = [];

	rows = 1;
	maxWidth = 0;

	setEditor(_editor) {
		this.editor = _editor;
	}

	getValue() {
		// return this.val;
		return this.editor.textInput;
	}

	setValue(value: string) {
		// this.val = value;
		this.editor.setValue(value);
	}

	getLineCount() {
		return this.rows;
	}

	// getLineContent() {
	// 	return "";
	// }

	// updateOptions(opt:TextMdOption) {
	// 	for(var key in opt) {
	// 		this.option[key] = opt[key];
	// 	}
	// }

	// onDidChangeContent(cb) {
	// 	this.onDidChangeContentCb = cb;
	// }
}
