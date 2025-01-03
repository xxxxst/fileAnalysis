/*
 * convert svg to font
 */
const { svg2Font, Font, writeToFile } = require('svg-to-fonts')

var srcPath = "./src/assets/rfontImg/*.svg";
var dstPath = "./src/assets/rfont/";

svg2Font({
	src: srcPath,
	dist: dstPath,
	fontFamily: 'rfont',
	fontName: 'rfont',
	fontFamilyClass: 'rfont-family',
	startCodePoint: 0xE000,
	customUnicodeList: [
		"□".charCodeAt(0).toString(16),
		"☑".charCodeAt(0).toString(16),
		"×".charCodeAt(0).toString(16),
	],
	fontTypes: ['eot', 'ttf'],
	ascent: 896,
	descent: -128,
	svgSize: 24,
	css: false,
	scss: true,
	symbol: false,
	html: false,
}).then(() => {
	console.log('svg2Font done !')
})
