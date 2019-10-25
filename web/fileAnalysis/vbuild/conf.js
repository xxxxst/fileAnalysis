const path = require('path');

const shortOutPath = 'dist/web'

var conf = {
	com: {
		shortOutPath: shortOutPath,
		cdn: true,

		outPath: path.resolve(__dirname, "../" + shortOutPath),
		assetsOutDir : "static/",

		page: {
			app: "index.html",
		},
		entry: {
			// polyfill: 'babel-polyfill',
			app: "./src/MainHome.ts",
		},
	},
	build: {
		
	},
	dev: {
		host: '0.0.0.0',
		port: 8081,

		// proxy
		proxyTable: {},
		proxyTable: {
			'/server': {
				target: 'http://localhost:8081/server',
				secure: false,
				changeOrigin: true,
				pathRewrite: {
					'^/server': ''
				}
			}
		},

	},
}

module.exports = conf
