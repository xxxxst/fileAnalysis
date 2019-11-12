
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import SimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';
import { TextLine } from 'src/components/util/SimpleMonacoEditor/model/TextLine';

@Component({ components: { } })
export default class ContentMain extends Vue {
	lines: TextLine[] = [new TextLine()];

	lineStyle = new class {
		height = "19px";
		lineHeight = "19px";
	};

	getEditor() {
		return this.$parent as SimpleMonacoEditor;
	}

	created() {
		
	}

	mounted() {
		
	}

	destryed() {
		
	}

	updateFontSize(fontSize, lineHeight) {
		var strH = lineHeight + "px";
		this.lineStyle.height = strH;
		this.lineStyle.lineHeight = this.lineStyle.height;
	}

	formatText(str) {
		var editor = this.getEditor();
		if(!editor) {
			return [];
		}

		var space = editor.option.spaceRender;
		var count = editor.option.model.option.tabSize;
		return editor.comCtl.formatText(str, space, count);
	}

	updateText(str) {
		this.lines = this.formatText(str);
	}

	onContentBoxMouseDownMainArea(evt:MouseEvent) {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}

		// right mouse down
		if(evt.button == 2) {
			return;
		}

		editor.setEditorFocus();

		var eleDown = evt.target as HTMLElement;
		var row = parseInt(eleDown.getAttribute("row"));
		var startCol = parseInt(eleDown.getAttribute("col"));
		if (isNaN(row) || row < 0 || row >= this.lines.length) {
			return;
		}

		var line = this.lines[row];
		var pos = 0;
		var col = 0;
		if (isNaN(startCol)) {
			col = line.length;
		} else {
			var px = evt.layerX;
			col = editor.calcPos(line.getLineStr(), px);
		}
		pos = line.pos + col;
		
		var curRow = editor.cursorWordPos.row;
		var curCol = editor.cursorWordPos.col;

		editor.markDownPos(evt, row, col, !evt.shiftKey);

		editor.setTextAreaCursorPos(pos);
		editor.updateCursorByWordPos();

		if(evt.shiftKey) {
			editor.setSelectRange(false, curRow, curCol, row, col);
		}
	}

	getRowText(row) {
		return this.lines[row].getLineStr();
	}
	
}
