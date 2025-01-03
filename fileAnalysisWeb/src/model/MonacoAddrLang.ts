
import * as monaco from "monaco-editor";

export var conf = {
	comments: {
		lineComment: '//'
	},
	brackets: [
		['[', ']'],
	]
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
			[/^address[\s]*=[\s*]*/, 'className', '@common'],
			{ include: '@common' },
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

export default function MonacoAddrLang() {
	monaco.languages.register({
		id: 'addr',
	});
	monaco.languages.setLanguageConfiguration("addr", conf as any);
	monaco.languages.setMonarchTokensProvider("addr", language as any);

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

