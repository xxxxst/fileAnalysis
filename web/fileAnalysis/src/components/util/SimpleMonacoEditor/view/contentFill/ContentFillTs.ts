
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import { VIgnore } from 'src/sdk/tsHelp/vue/VIgnore';
import SimpleMonacoEditor from 'src/components/util/SimpleMonacoEditor/SimpleMonacoEditorTs';

@Component({ components: { } })
export default class ContentFill extends Vue {
	// @Model('change', { type: String, default: "" }) readonly textInput: string;
	// isFocus = false;

	get textInput() {
		var editor = this.getEditor();
		return editor.textInput;
	}
	set textInput(val) {
		var editor = this.getEditor();
		editor.textInput = val;
	}

	cursorStyle = new class {
		display = "none";
		height = "19px";
		left = "0";
		top = "0";
	}

	textareaStyle = new class {
		left = "0";
		top = "0";
		width = "1px";
		background = "transparent";
		height = "19px";
		fontSize = "14px";
		lineHeight = "19px";
		fontFamily = "'simsun', Consolas, 'Courier New', monospace";
	}

	getEditor() {
		return this.$parent as SimpleMonacoEditor;
	}

	get isFocus() {
		var editor = this.getEditor();
		return editor && editor.isFocus;
	}

	get cursorHold() {
		var editor = this.getEditor();
		return editor && editor.cursorHold;
	}

	get readOnly() {
		var editor = this.getEditor();
		return editor && editor.option.readOnly;
	}

	get isIMEStart() {
		var editor = this.getEditor();
		return editor && editor.isIMEStart;
	}

	lineHeight = 19;

	created() {
		
	}

	mounted() {
		
	}

	destryed() {
		
	}

	updateFont(fontFamily) {
		this.textareaStyle.fontFamily = fontFamily;
	}

	updateRowHeight(height) {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}

		this.lineHeight = height;

		var strH = height + "px";
		this.textareaStyle.fontSize = editor.option.fontSize + "px";
		this.textareaStyle.lineHeight = strH;
		this.textareaStyle.height = strH;
		this.cursorStyle.height = strH;
	}

	updateCursor(pos) {
		var x = pos.x + "px";
		var y = pos.y + "px";
		this.cursorStyle.left = x;
		this.cursorStyle.top = y;

		this.textareaStyle.left = x;
		this.textareaStyle.top = y;
	}

	updateTextareaWidth(width) {
		this.textareaStyle.width = width + "px";
	}

	setFocus() {
		this.cursorStyle.display = "";
	}

	setIMEMode(isIME) {
		if(isIME) {
			this.textareaStyle.background = "#1e1e1e";
			this.textareaStyle.height = this.lineHeight + "px";
			this.cursorStyle.display = "none";
			this.cursorStyle.display = "none";
		} else {
			this.textareaStyle.width = "1px";
			this.textareaStyle.height = "19px";
			this.textareaStyle.background = "transparent";
			this.cursorStyle.display = "";
		}
	}
	
	onTextareaBlur() {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}
		editor.isFocus = false;
		editor.cursorHold = false;

		this.cursorStyle.display = "none";
	}

	testCharWidth() {
		var editor = this.getEditor();
		if(!editor) {
			return;
		}

		if (editor.needTestCharWidth) {
			return;
		}

		var ele = this.$refs.charTest as HTMLSpanElement;
		ele.style.fontFamily = editor.option.fontFamily;
		ele.innerHTML = "a";

		var width = ele.getBoundingClientRect().width;
		// console.info("aaa", width);
		if (width == 0) {
			editor.needTestCharWidth = true;
			return;
		}

		if (width == editor.charWidth) {
			return;
		}

		editor.charWidth = width;
		// this.$nextTick(()=>{
		// });
	}
	
}
