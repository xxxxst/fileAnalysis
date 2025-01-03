
const Fs = require("fs");
const bodyParser = require('body-parser');
const Path = require("path")

module.exports = function(app) {
	var local = this;

	local.init = function() {
		app.use(bodyParser.json());
		// app.use(bodyParser.urlencoded({extended: false}));

		app.all("*", (req, res, next) => {
			var origin = req.headers["origin"] || "*";
			res.header("Access-Control-Allow-Origin", origin);
			res.header("Access-Control-Allow-Credentials", "true");
			next();
		});
		app.options("*", (req, res) => {
			res.header("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, X-File-Name,Token,Cookie,authorization");
			res.header("Access-Control-Allow-Methods", "POST,GET,PUT,PATCH,DELETE,OPTIONS");
			res.end();
		});

		function formatPath(path) {
			path = path.trim();
			if(path.indexOf(":") >= 0) {
				return path;
			}
			if(path != "" && path.charAt(0) == "/") {
				return path;
			}

			path = "test/" + path;
			return path;
		}
		
		app.get("/server/fs/readFile/:path(*)", function(req, res){
			try{
				var path = req.params.path;
				path = formatPath(path);
				if(!Fs.existsSync(path)) {
					res.status(404);
					res.send("");
					return;
				}
				var rs = Fs.createReadStream(path);
				rs.on('data',function(data){
					res.write(data)
				});
				rs.on('end',function(){
					res.end();
				})
			} catch(ex){
				res.end();
			}
		});
		
		app.post("/server/fs/saveFile/:path(*)", function(req, res){
			try{
				var path = req.params.path;
				path = formatPath(path);
				var opt = req.body;
				var data = opt.data;

				Fs.writeFileSync(path, data, {flag: "w"});
				res.send({ data: true });
			} catch(ex){
				res.send({ data: false});
			}
		});
		
		app.get("/server/fs/delFile/:path(*)", function(req, res){
			function deleteall(path) {
				var files = [];
				if(Fs.existsSync(path)) {
					files = Fs.readdirSync(path);
					files.forEach(function(file, index) {
						var curPath = path + "/" + file;
						if(Fs.statSync(curPath).isDirectory()) { // recurse
							deleteall(curPath);
						} else { // delete file
							Fs.unlinkSync(curPath);
						}
					});
					Fs.rmdirSync(path);
				}
			}

			try{
				var path = req.params.path;
				path = formatPath(path);
				var stat = Fs.statSync(path);
				if(!stat) {
					res.send({ data: false });
					return;
				}
				if(stat.isFile()) {
					Fs.unlinkSync("dist/temp/" + path);
				} else if(stat.isDirectory()) {
					deleteall(path);
				} else {
					res.send({ data: false });
					return;
				}
				res.send({ data: true });
			}catch(ex){
				res.send({ data: false });
			}
		});

		function getFileType(stat) {
			var type = 0;
			if(stat.isFile()) {
				type = 1;
			} else if(stat.isDirectory()) {
				type = 2;
			}
			return type;
		}

		app.get("/server/fs/mkdir/:path(*)", function(req, res){
			try {
				function mkdirsSync(dirname) {
					if (Fs.existsSync(dirname)) {
						return true;
					}
					if (!mkdirsSync(Path.dirname(dirname))) {
						return false;
					}
					
					Fs.mkdirSync(dirname);
					return true;
				}
				var path = req.params.path;
				path = formatPath(path);
				// Fs.mkdirSync(path);
				mkdirsSync(path);

				res.end();
			} catch (ex) {
				res.end();
			}
		});

		app.get("/server/fs/stat/:path(*)", function(req, res){
			try {
				var path = req.params.path;
				path = formatPath(path);
				var stat = Fs.statSync(path);
				if (!stat) {
					res.send(null);
					return;
				}
				var rst = {
					type: getFileType(stat),
					size: stat.size,
					mtimeMs: stat.mtimeMs,
					ctimeMs: stat.ctimeMs,
				}
				res.send(rst);
			} catch (ex) {
				res.send(null);
			}
		});
		
		app.get("/server/fs/fileList/:path(*)", function(req, res){
			try {
				var path = req.params.path;
				path = formatPath(path);
				var stat = Fs.statSync(path);
				if(!stat || !stat.isDirectory()) {
					res.send([]);
					return;
				}

				var arr = Fs.readdirSync(filePath);
				var rst = [];
				for(var i = 0; i < arr.length; ++i) {
					var stat = Fs.statSync(path + "/" + arr[i]);

					var md = {
						type: getFileType(stat),
						name: arr[i],
						size: stat.size,
						mtimeMs: stat.mtimeMs,
						ctimeMs: stat.ctimeMs,
					}
					rst.push(md);
				}
				res.send(rst);

			} catch(ex) {
				res.send([]);
			}
		});
	}

	local.init();
}
