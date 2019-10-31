import { TextMd } from 'src/components/util/SimpleMonacoEditor/model/TextMd';

export class EditorOption {
	model? = new TextMd();
	fontSize? = 14;
	readOnly? = false;
	fontFamily? = "'simsun', Consolas, 'Courier New', monospace";
	spaceRender? = "&ensp;";
	theme? = "vs-dark";				//unused
	minimap? = { enabled: false };	//unused
	lineNumbersMinChars? = 3;		//unused
	lineDecorationsWidth? = 0;		//unused
	wordWrap? = "off";				//unused
	autoClosingBrackets? = "never";	//unused
}
