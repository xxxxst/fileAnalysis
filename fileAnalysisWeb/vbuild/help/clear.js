// 清空文件夹
const fs = require("fs");
const Path = require("path");

class ClearCtl {
	static delDir(path) {
		if (!fs.existsSync(path)) {
			return;
		}

		fs.readdirSync(path).forEach((file) => {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) {
				this.delDir(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}

	// 
	static clear(path) {
		if (!fs.existsSync(path)) {
			return;
		}

		fs.readdirSync(path).forEach((file) => {
			var curPath = path + "/" + file;
			if (fs.statSync(curPath).isDirectory()) {
				this.delDir(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
	}
}

module.exports = (path) => ClearCtl.clear(path);