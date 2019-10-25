const merge = require('webpack-merge');
const webpackProd = require('./webpack.prod');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const sourceMap = false;

const webpackConfig = merge(webpackProd, {
	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: 'server',
			analyzerHost: 'localhost',
			analyzerPort: 8888,
			reportFilename: 'index.html',
			defaultSizes: 'parsed',
			openAnalyzer: false,
			generateStatsFile: false,
			statsFilename: 'stats.json',
			statsOptions: null,
			logLevel: 'info'
		}),
	],
});

module.exports = webpackConfig