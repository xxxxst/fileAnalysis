
const fs = require("fs");
const clear = require("./clear");
const cp = require("./cp");

var src = "./dist/web/";
var dst1 = "../catBookAndroid/app/src/main/assets/web/";
var dst2 = "../catBookElectron/assets/web/";

(function () {
	if (!fs.existsSync(src)) {
		return;
	}
	if (!fs.existsSync(dst1)) {
		return;
	}
	if (!fs.existsSync(dst2)) {
		return;
	}

	clear(dst1);
	clear(dst2);
	cp(src, dst1);
	cp(src, dst2);
})();