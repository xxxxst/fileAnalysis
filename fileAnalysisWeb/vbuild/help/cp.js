// 复制文件/文件夹

const fs = require("fs");
const Path = require("path");

class cpCtl {
	static lastStr(str) {
		if (str != "") {
			return str.charAt(str.length - 1);
		}
		return "";
	}

	static mkdirsSync(dirname) {
		if (dirname == "") {
			return;
		}
		if (fs.existsSync(dirname)) {
			return;
		}

		this.mkdirsSync(Path.dirname(dirname))
		fs.mkdirSync(dirname);
	}

	static copyDir(src, dst) {
		if (!fs.existsSync(src)) {
			return;
		}
		if (!fs.existsSync(dst)) {
			this.mkdirsSync(dst);
		}
		fs.readdirSync(src).forEach((path) => {
			var _src = src + '/' + path;
			var _dst = dst + '/' + path;
			if (fs.statSync(_src).isDirectory()) {
				this.copyDir(_src, _dst);
			} else {
				this.copyFile(_src, _dst);
			}
		});
	}

	static copyFile(src, dst) {
		fs.copyFileSync(src, dst);
	}

	// 
	static cp(src, dst) {
		if (!fs.existsSync(src)) {
			return;
		}

		if (!fs.statSync(src).isDirectory() && (this.lastStr(dst) == "/" || this.lastStr(dst) == "\\")) {
			dst = dst + Path.basename(src);
		}

		if (fs.statSync(src).isDirectory()) {
			this.copyDir(src, dst);
		} else {
			this.copyFile(src, dst);
		}
	}
}

module.exports = (src, dst) => cpCtl.cp(src, dst);