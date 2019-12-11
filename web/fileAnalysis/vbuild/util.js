const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const conf = require('./conf');
const fs = require("fs");

var util = {
	isProduction: false,
	com: {
		getWebpackConf: null,
	},
	dev: {
		devtool: 'cheap-module-eval-source-map',
		cssSourceMap: true,

		getHtmlWebpackPluginConf: function(entName, fileName, tmplName) {
			return {
				filename: path.resolve(__dirname, conf.com.outPath + "/" + fileName),
				template: tmplName,
				inject: true,
				cdn: false,
				release: false,
				chunks: ['manifest', 'vendors', entName]
			}
		}
	},
	build: {
		devtool: 'cheap-module-source-map',
		cssSourceMap: false,

		getHtmlWebpackPluginConf: function(entName, fileName, tmplName) {
			return {
				filename: path.resolve(__dirname, conf.com.outPath + "/" + fileName),
				template: tmplName,
				inject: true,
				cdn: true,
				release: true,
				minify: {
					removeComments: true,
					collapseWhitespace: true,
					removeAttributeQuotes: true
					// more options:
					// https://github.com/kangax/html-minifier#options-quick-reference
				},
				chunks: ['manifest', 'vendors', entName]
			}
		}
	}
}

function getWebpackConf(type) {
	var mapPage = conf.com.page;
	var arrPlugin = [];
	for (var key in mapPage) {
		var name = mapPage[key];
		if (!/\.html$/.test(name)) {
			continue;
		}

		var tmplName = name.replace(/\.[^\.]*$/, "") + ".hbs";

		arrPlugin.push(
			new HtmlWebpackPlugin(util[type].getHtmlWebpackPluginConf(key, name, tmplName))
		);
	}

	return {
		plugins: arrPlugin
	};
}

util.com.getWebpackConf = getWebpackConf;

exports.config = util;

exports.cssLoaders = function(options) {
	options = options || {}

	const cssLoader = {
		loader: 'css-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	const cssLoaderRelative = {
		loader: 'css-loader-relative'
	}

	const postcssLoader = {
		loader: 'postcss-loader',
		options: {
			sourceMap: options.sourceMap
		}
	}

	// generate loader string to be used with extract text plugin
	function generateLoaders(loader, loaderOptions) {
		const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

		if (loader) {
			loaders.push({
				loader: loader + '-loader',
				options: Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap
				})
			});
			loaders.push(cssLoaderRelative);
		}

		// Extract CSS when that option is specified
		// (which is the case during production build)
		if (options.extract) {
			// return ExtractTextPlugin.extract({
			// 	use: loaders,
			// 	fallback: 'vue-style-loader',
			// 	publicPath: '../../'
			// })
			return [{
				loader: MiniCssExtractPlugin.loader,
				options: {
					publicPath: '../../'
				}
			}].concat(loaders)
		} else {
			return ['vue-style-loader'].concat(loaders)
		}
	}

	// https://vue-loader.vuejs.org/en/configurations/extract-css.html
	return {
		css: generateLoaders(),
		postcss: generateLoaders(),
		less: generateLoaders('less'),
		sass: generateLoaders('sass', {
			indentedSyntax: true
		}),
		scss: generateLoaders('sass'),
		stylus: generateLoaders('stylus'),
		styl: generateLoaders('stylus')
	}
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function(options) {
	const output = []
	const loaders = exports.cssLoaders(options)

	for (const extension in loaders) {
		const loader = loaders[extension]
		output.push({
			test: new RegExp('\\.' + extension + '$'),
			use: loader
		})
	}

	return output
}

exports.createNotifierCallback = () => {
	const notifier = require('node-notifier')

	return (severity, errors) => {
		if (severity !== 'error') return

		const error = errors[0]
		const filename = error.file && error.file.split('!').pop()

		notifier.notify({
			title: packageConfig.name,
			message: severity + ': ' + error.name,
			subtitle: filename || '',
			icon: path.join(__dirname, 'logo.png')
		})
	}
}