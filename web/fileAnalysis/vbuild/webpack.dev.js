const Path = require('path');
const fs = require("fs")
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const merge = require('webpack-merge');
const baseWebpack = require('./webpack.base');
const util = require('./util');
const conf = require('./conf');
const proxy = require('http-proxy-middleware');

const host = process.env.HOST || conf.dev.host;
const port = (process.env.PORT && Number(process.env.PORT)) || conf.dev.port;

const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT && Number(process.env.PROXY_PORT);
if(conf.dev.proxyTable && proxyHost && proxyPort){
	for(var key in conf.dev.proxyTable){
		var str = conf.dev.proxyTable[key].target;
		str = str.replace("localhost", proxyHost);
		str = str.replace("8081", proxyPort);
		conf.dev.proxyTable[key].target = str;
	}
}

// var host = webpackConfig.devServer.host;
// var port = webpackConfig.devServer.port;

const webpackConfig = merge(baseWebpack, {
	mode: "development",
	devtool: util.config.dev.devtool,
	output: {
		path: conf.com.outPath,
		filename: '[name].js',
		chunkFilename: '[name].js'
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}, {
			test: /\.(sa|sc)ss$/,
			use: [
				'style-loader',
				'css-loader',
				'sass-loader',
			],
		}]
	},
	devServer: {
		clientLogLevel: 'none',
		hot: true,
		contentBase: false,
		compress: true,
		host: host,
		port: port,
		open: false,
		overlay: {
			warnings: false,
			errors: true
		},
		// proxy: conf.dev.proxyTable,
		publicPath: "/",
		quiet: true,
		watchOptions: {
			poll: false,
		},
		headers: {
			"Access-Control-Allow-Origin": "*"
		},
		setup(app) {
			for(var key in conf.dev.proxyTable) {
				app.use(proxy(key, conf.dev.proxyTable[key]));
			}

			var bodyParser = require('body-parser');
			app.use(bodyParser.json());

			app.all("/server/file/get/:name(*)", function(req, res) {
				var data = "";
				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");
					data = fs.readFileSync("dist/temp/" + name, "utf8");
				} catch (ex) {}
				res.send(data);
			});

			app.all("/server/file/each/:name(*)", function(req, res) {
				var data = [];
				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");
					var path = "dist/temp/" + name;
					var temp = fs.readdirSync(path);
					for (var i = 0; i < temp.length; ++i) {
						var info = fs.statSync(path + "/" + temp[i]);
						data.push({
							name: temp[i],
							isDirectory: info.isDirectory(),
						});
					}
				} catch (ex) {}
				res.send(data);
			});

			app.all("/server/directory/exist/:name(*)", function(req, res) {
				var data = false;
				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");
					var path = "dist/temp/" + name;
					data = fs.existsSync(path);
					if (data) {
						data = fs.lstatSync(path).isDirectory();
					}
				} catch (ex) {}
				res.send(data);
			});

			app.all("/server/file/exist/:name(*)", function(req, res) {
				var data = false;
				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");
					data = fs.existsSync("dist/temp/" + name);
					if (data) {
						data = !fs.lstatSync("dist/temp/" + name).isDirectory();
					}
				} catch (ex) {}
				res.send(data);
			});

			app.all("/server/file/saveString/:name(*)", bodyParser.json(), function(req, res) {
				function mkdirsSync(dirname) {
					if(dirname == ""){
						return;
					}
					if (fs.existsSync(dirname)) {
						return;
					}
					
					mkdirsSync(Path.dirname(dirname))
					fs.mkdirSync(dirname);
				}

				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");

					var path = "dist/temp/" + name;
					mkdirsSync(Path.dirname(path));

					var data = req.body.data;
					// fs.writeFileSync(path, '\ufeff' + data, "utf8");
					fs.writeFileSync(path, data, "utf8");
					res.send(true);
				} catch (ex) {
					res.send(false);
				}
			});

			app.all("/server/file/delete/:name(*)", function(req, res) {
				function deleteFolderRecursive(path) {
					if (fs.existsSync(path)) {
						fs.readdirSync(path).forEach(function(file) {
							var curPath = path + "/" + file;
							if (fs.statSync(curPath).isDirectory()) {
								// recurse
								deleteFolderRecursive(curPath);
							} else {
								// delete file
								fs.unlinkSync(curPath);
							}
						});
						fs.rmdirSync(path);
					}
				};

				try {
					var name = req.params.name;
					name = name.replace(/\.\./g, "__");
					deleteFolderRecursive("dist/temp/" + name);

					res.send(true);
				} catch (ex) {
					res.send(false);
				}
			});
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new FriendlyErrorsPlugin({
			compilationSuccessInfo: { messages: [
				// "----------------------------------------",
				`   server run at: http://${host}:${port} `,
				// "----------------------------------------"
			]},
			// onErrors: util.createNotifierCallback()
		}),
	]
}, util.config.com.getWebpackConf("dev"));

// 	console.info("----------------------------------------");
// 	console.info(`   server run at: http://${host}:${port} `);
// 	console.info("----------------------------------------");

module.exports = webpackConfig;
