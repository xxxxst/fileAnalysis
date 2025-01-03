
const Fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Path = require("path");
const server = require("./vbuild/server");
const MockFixedPlugin = require("./vbuild/MockFixedPlugin");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MonacoLocalesPlugin = require('monaco-editor-locales-plugin');
const mapMonacoLang = require('./vbuild/mapMonacoLang');

var pages = {};
var entryPath = "./src/entry";
Fs.readdirSync(entryPath).forEach((path)=> {
	name = path.replace(/.[^.]*$/, "");

	pages[name] = {
		entry: `${entryPath}/${name}`,
		template: `./public/${name}.html`,
	}
});

module.exports = {
	outputDir: Path.resolve(__dirname, "./dist/web"),
	assetsDir: "./static/",
	publicPath: "./",
	lintOnSave: 'error',
	runtimeCompiler: false,

	productionSourceMap: false,
	pages: pages,
	css: {
		loaderOptions: {
			postcss: {
                plugins: [
                    require('postcss-plugin-px2rem')({
						remUnit: 100,
					})
				]
			},
			less: {
                lessOptions: {
                    javascriptEnabled: true,
                }
			}
		}
	},

	configureWebpack: config => {
		config.resolve.alias["@img"] = Path.resolve(__dirname, "./src/assets/img");
		// config.resolve.alias["vue$"] = "vue/dist/vue.esm-bundler.js";

        config.plugins.forEach((val) => {
            if (val instanceof HtmlWebpackPlugin) {
				val.options.debug = process.env.NODE_ENV != "production";
            }
		});
		
		config.plugins.push(
			new MockFixedPlugin(),
			new MonacoWebpackPlugin({
				languages: ['json']
			}),
			new MonacoLocalesPlugin({
				languages: ["zh-cn"],
				logUnmatched: true,
				mapLanguages: mapMonacoLang,
			}),
			// new VueHookWebpackPlugin(),
			// new VueBindToModelWebpackPlugin(),
		);
	},

	devServer: {
		open: false,
		host: "0.0.0.0",
		port: process.env.PORT || 8082,
		historyApiFallback: false,
		disableHostCheck: true,
		setup: server,
	}
}
