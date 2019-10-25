const path = require('path');
const merge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const vueLoaderConfig = require('./vue-loader.conf');
const conf = require('./conf');
const util = require('./util');
const isProduction = util.config.isProduction;
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MonacoLocalesPlugin = require('monaco-editor-locales-plugin');
const mapMonacoLang = require('./mapMonacoLang');
// console.info(isProduction);

function resolve(dir) {
	return path.join(__dirname, '..', dir)
}

var webpackConf = {
	entry: conf.com.entry,
}

module.exports = merge(webpackConf, {
	context: path.resolve(__dirname, '../'),
	output: {
		path: conf.com.outPath,
		filename: conf.com.assetsOutDir + 'js/[name].[contenthash:7].js',
		chunkFilename: conf.com.assetsOutDir + 'js/[name].[contenthash:7].js'
	},
	resolve: {
		extensions: ['.js', '.vue', '.json', '.ts'],
		alias: {
			'vue$': 'vue/dist/vue.esm.js',
			'@': resolve('src'),
			'src': resolve('./src'),
		}
	},
	module: {
		rules: [{
			test: /\.vue$/,
			// type: 'javascript/auto',
			// loader: 'happypack/loader?id=vue',
			loader: 'vue-loader',
			options: vueLoaderConfig
		}, {
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10000,
				name: conf.com.assetsOutDir + 'img/[name].[contenthash:7].[ext]'
			},
			// exclude: [ /static/ ],
		}, {
			test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10000,
				name: conf.com.assetsOutDir + 'media/[name].[contenthash:7].[ext]'
			},
		}, {
			test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
			loader: 'url-loader',
			options: {
				limit: 10000,
				name: conf.com.assetsOutDir + 'fonts/[name].[contenthash:7].[ext]'
			},
		}, {
			test: /\.ts$/,
			exclude: /node_modules/,
			enforce: 'pre',
			loader: 'tslint-loader'
		}, {
			test: /\.tsx?$/,
			loader: 'ts-loader',
			// loader: 'happypack/loader?id=ts',
			exclude: /node_modules/,
			options: {
				appendTsSuffixTo: [/\.vue$/],
				transpileOnly: true
			}
		}, {
			test: /\.hbs$/,
			loader: 'handlebars-loader'
		}, ]
	},
	node: {
		// prevent webpack from injecting useless setImmediate polyfill because Vue
		// source contains it (although only uses it if it's native).
		setImmediate: false,
		// prevent webpack from injecting mocks to Node native modules
		// that does not make sense for the client
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		child_process: 'empty'
	},
	plugins: [
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, '../static'),
			to: conf.com.assetsOutDir,
			ignore: ['.*']
		}]),
		new MonacoWebpackPlugin({
			languages: ['json']
		}),
		new MonacoLocalesPlugin({
			languages: ["zh-cn"],
			logUnmatched: true,
			mapLanguages: mapMonacoLang,
		}),
	],
});