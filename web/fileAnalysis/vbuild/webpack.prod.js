
const util = require('./util');
util.config.isProduction = true;

const path = require('path');
const merge = require('webpack-merge');
const baseWebpack = require('./webpack.base');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const RemoveStrictPlugin = require('remove-strict-webpack-plugin');
const conf = require('./conf');

const sourceMap = false;

const webpackConfig = merge(baseWebpack, {
	mode: "production",
	devtool: false,
	module: {
		rules: [{
			test: /\.css$/,
			use: [{
				loader: MiniCssExtractPlugin.loader,
				options: {
					publicPath: '../'
				}
			}, "css-loader"]
		}, {
			test: /\.(sa|sc)ss$/,
			use: [
				MiniCssExtractPlugin.loader,
				"css-loader",
				'sass-loader',
			],
		} ]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new UglifyJsPlugin({
			uglifyOptions: {
				output: {
					comments: false
				},
				compress: {
					warnings: false
				}
			},
			sourceMap: sourceMap,
			parallel: true
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].[contenthash:8].css',
			chunkFilename: 'css/[name].[contenthash:8].css' // use contenthash *
		}),
		new OptimizeCSSPlugin({
			cssProcessorOptions: {
				safe: true
			}
		}),
		new RemoveStrictPlugin()
	],
	optimization: {
		// chunk for the webpack runtime code and chunk manifest
		runtimeChunk: {
			name: 'manifest'
		},
		// https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693
		splitChunks: {
			chunks: 'initial',
			cacheGroups: {
				vendors: {
					name: 'vendors',
					test: /[\\/]node_modules[\\/]/,
					priority: 10,
				}
			}
		}
	}
}, util.config.com.getWebpackConf("build"));

module.exports = webpackConfig