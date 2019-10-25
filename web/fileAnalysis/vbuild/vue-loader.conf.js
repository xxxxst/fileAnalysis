'use strict'
const util = require('./util')
const config = require('./conf')
const isProduction = process.env.NODE_ENV === 'production';
const sourceMapEnabled = isProduction ? false : true;
module.exports = {
	loaders: util.cssLoaders({
		sourceMap: sourceMapEnabled,
		// usePostCSS: true,
		// extract: isProduction
	}),
	cssSourceMap: sourceMapEnabled,
	cacheBusting: true,
	preserveWhitespace: false,
	transformToRequire: {
		video: ['src', 'poster'],
		source: 'src',
		img: 'src',
		image: 'xlink:href'
	},
	options: {
		loaders: {
			scss: 'vue-style-loader!css-loader!css-loader-relative!sass-loader', // <style lang="scss">
			sass: 'vue-style-loader!css-loader!css-loader-relative!sass-loader?indentedSyntax' // <style lang="sass">
		},
	}
}