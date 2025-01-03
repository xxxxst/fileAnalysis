/*
 * convert svg to font
 */
const { svg2Font, Font, writeToFile } = require('svg-to-fonts')
const path = require('path')
const fs = require('fs')

var srcPath = "./src/assets/img/*.svg";
var dstPath = "./src/assets/font/";

svg2Font({
	src: srcPath,
	dist: dstPath,
	fontFamily: 'sfont',
	fontName: 'sfont',
	startCodePoint: 0xE000,
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
