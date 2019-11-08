
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import SimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';

class SelectMaskStyle {
	pos = 0;
	style = new class {
		left = "0";
		// top = "0";
		width = "0";
	}
}

class SelectLineItem {
	row = 0;
	pos = 0;
	length = 0;
	style = new class {
		top = "0";
		height = "19px";
	};
	data: SelectMaskStyle[] = [];
}

@Component({ components: { } })
export default class ContentBack extends Vue {
	// isFocus = false;

	selectRowStyle = new class {
		left = "0";
		top = "0";
		height = "19px";
	};

	selectMaskStyle:SelectLineItem[] = [];
	// selectWordRange = { startRow: 0, startCol: 0, endRow:0, endCol: 0 };

	getEditor() {
		return this.$parent as SimpleMonacoEditor;
	}

	get isFocus() {
		var editor = this.getEditor();
		return editor && editor.isFocus;
	}

	created() {
		
	}

	mounted() {
		
	}

	destryed() {
		
	}

	updateSelectRow() {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}
		var row = editor.cursorWordPos.row;
		editor.lineNoMd.activeLine = row;
		this.selectRowStyle.top = (row * editor.lineHeight) + "px";
	}

	updateRowHeight(height:number) {
		this.selectRowStyle.height = height + "px";

		this.updateSelectRangeHieght();
	}

	updateSelectRangeHieght() {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}
		var arr = this.selectMaskStyle;
		var strH = editor.lineHeight + "px";
		for(var i = 0; i < arr.length; ++i) {
			arr[i].style.height = strH;
		}
	}

	isSelectRange() {
		var editor = this.getEditor();
		if(!editor) {
			return false;
		}
		var md = editor.selectWordRange;
		return !(md.startRow == md.endRow && md.startCol == md.endCol);
	}

	updateSelectRange() {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}

		var arr: SelectLineItem[] = [];
		var md = editor.selectWordRange;
		var strH = editor.lineHeight + "px";

		for(var i = md.startRow; i <= md.endRow; ++i) {
			if(i < 0 || i >= editor.totalRow) {
				break;
			}
			var tmp = new SelectLineItem();
			tmp.style.top = i * editor.lineHeight + "px";
			tmp.style.height = strH;
			var left = 0;
			var right = 0;
			var str = editor.getRowText(i);
			if(i == md.startRow) {
				left = editor.calcTextLen(str.substr(0, md.startCol));
			}
			
			if(i == md.endRow) {
				right = editor.calcTextLen(str.substr(0, md.endCol));
			} else {
				right = editor.calcTextLen(str) + 1;
			}

			var tmp2 = new SelectMaskStyle();
			tmp2.style.left = left * editor.charWidth + "px";
			tmp2.style.width = (right - left) * editor.charWidth + "px";
			tmp.data.push(tmp2);
			arr.push(tmp);
		}

		this.selectMaskStyle = arr;
	}
}
