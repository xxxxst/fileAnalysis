
import * as monaco from "monaco-editor";
// import * as monacoNls from "monaco-editor/esm/vs/nls";

// var aaa = monacoNls.localize;
// console.info(monacoNls.localize);

export var conf = {
	comments: {
		lineComment: '//'
	},
	brackets: [
		// ['{', '}'],
		['[', ']'],
		// ['(', ')'],
	]
	// autoClosingPairs: [
	//     { open: '{', close: '}' },
	//     { open: '[', close: ']' },
	//     { open: '(', close: ')' },
	//     { open: '"', close: '"' },
	//     { open: '\'', close: '\'' },
	// ],
	// surroundingPairs: [
	//     { open: '{', close: '}' },
	//     { open: '[', close: ']' },
	//     { open: '(', close: ')' },
	//     { open: '"', close: '"' },
	//     { open: '\'', close: '\'' },
	// ]
};
export var language = {
	defaultToken: '',
	tokenPostfix: '',
	// we include these common regular expressions
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	keywords: [
		"char", "byte", "short", "ushort", "int", "uint", "long", "int64", "uint64", "float", "double", "WORD", "DWORD", "BYTE", "LONG"
	],
	tokenizer: {
		root: [
			[/^(\[)([^\]\s]*)(\s*\|\s*)([^\]]*)(\])/, ['', 'className', '', 'classDesc', '']],
			// [/^([^\t]*)(\t)([^\t]*)(\t)([^\t]*)/, ['', '', '', '', 'comment']],
			// [/^([^\t]*)(\t)/, {
			// 	cases: {
			// 		'@keywords': { token: 'keyword.$0' },
			// 	}
			// }],
			// [/^([a-zA-Z_]\w*)(\[?\s*)(\d*)(\s*\]?\s+)/, [
			// 	{ cases: {
			// 		'@keywords': { token: 'keyword.$0' },
			// 	} },
			// 	'', 'number',
			// 	{ token:'', next:'@fields2' },
			// ]],
			[/^address[\s]*=[\s*]*/, 'className', '@common'],
			{ include: '@common' },
			// [/^([a-zA-Z_]\w*)(\[\s*)(\d+)(\s*\])(\s+)/, [
			// 	{ cases: {
			// 		'@keywords': { token: 'keyword.$0' },
			// 	} },
			// 	'', 'number', '',
			// 	{ token:'', next:'@fields2' },
			// ]],
			// [/[a-zA-Z_]\w*/, {
			// 	cases: {
			// 		'@keywords': { token: 'keyword.$0' },
			// 	}
			// }],
			// sections
			// [/^\[[^\]]*\]/, 'metatag'],
			// [/^([^\t]*)(\t)([^\t]*)(\t)([^\t]*)/, ['', '', '', '', 'aaa']],

			// [/^\[([^\]]*)([\t]?)\]/, ['className', 'classDesc']],
			// // keys
			// [/(^\w+)(\s*)(\=)/, ['key', '', 'delimiter']],
			// // whitespace
			// { include: '@whitespace' },
			// numbers
			// [/\d+/, 'number'],
			// // strings: recover on non-terminated strings
			// [/"([^"\\]|\\.)*$/, 'string.invalid'],
			// [/'([^'\\]|\\.)*$/, 'string.invalid'],
			// [/"/, 'string', '@string."'],
			// [/'/, 'string', '@string.\''],
		],
		common: [
			[/^[a-zA-Z_]+$/, 'identifier'],
			[/^[a-zA-Z_]\w*/, {
				cases: {
					'@keywords': { token: 'keyword.$0' },
					'@default': 'type.identifier',
				}
			}],
			[/[a-zA-Z_]\w*/, 'key'],
			[/\d+/, 'number'],
			[/"([^"\\]|\\.)*$/, 'string.invalid'],
			[/'([^'\\]|\\.)*$/, 'string.invalid'],
			[/"/, 'string', '@string_double'],
			[/'/, 'string', '@string_single'],
			[/`/, 'string', '@string_backtick'],
			[/=/, 'gray'],
			[/;\/\//, 'gray', '@comment'],
			[/;/, 'gray'],
			[/\/\//, 'gray', '@comment'],
		],
		comment: [
			[/.*/, 'comment', '@pop'],
		],
		field1: [
			[/^([a-zA-Z_]\w*)([^\s]*)/, [
				{
					cases: {
						'@keywords': { token: 'keyword.$0' },
					}
				},
				{ token: 'className', next: '@fields2' },
			]],
		],
		fields2: [
			// [/([^\s]*)(\s+)([^\s]*)/, ['', '', {token:'comment',next:'@root'}]],
			[/[^\s]+\s+/, '', '@fields3'],
		],
		fields3: [
			[/=\s*/, 'gray', '@fields3Value'],
			[/[^\s]+\s+/, '', '@fields4'],
		],
		fields4: [
			[/[^\s]+\s*/, 'comment', '@root'],
		],
		fields3Value: [
			[/\d+/, 'number', '@fields4'],
			[/"/, 'string', '@string."'],
			[/'/, 'string', '@string.\''],
		],
		// aaa: [
		// 	[/[a-zA-Z_]\w*/, {
		// 		cases: {
		// 			'@keywords': { token: 'keyword.$0' },
		// 		}
		// 	}],
		//     [/\d+/, 'number'],
		// ],
		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/^\s*[#;].*$/, 'comment'],
		],
		string: [
			[/[^\\"']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/["']/, {
				cases: {
					'$#==$S2': { token: 'string', next: '@pop' },
					'@default': 'string'
				}
			}]
		],
		string_double: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],
		string_single: [
			[/[^\\']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/'/, 'string', '@pop']
		],
		string_backtick: [
			[/\$\{/, { token: 'delimiter.bracket', next: '@bracketCounting' }],
			[/[^\\`$]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/`/, 'string', '@pop']
		],
		bracketCounting: [
			[/\{/, 'delimiter.bracket', '@bracketCounting'],
			[/\}/, 'delimiter.bracket', '@pop'],
			{ include: 'common' }
		],
	},
};

export default function MonacoAnaLang() {
	monaco.languages.register({
		id: 'ana',
		// extensions: ['.ini', '.properties', '.gitconfig'],
		// filenames: ['config', '.gitattributes', '.gitconfig', '.editorconfig'],
		// aliases: ['struct'],
		// loader: function () { return {conf:conf,language:language} }
	});
	monaco.languages.setLanguageConfiguration("ana", conf as any);
	monaco.languages.setMonarchTokensProvider("ana", language as any);

	monaco.editor.defineTheme('vs-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'className', foreground: 'c586c0' },
			{ token: 'classDesc', foreground: '558b3a' },
			{ token: 'gray', foreground: '777777' },
			// { token: 'aaa', foreground: '558b3a' },
		],
		colors: {},
	});
}

