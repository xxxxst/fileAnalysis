
export default class FileCache {
	file: Blob = null;
	sliceCount = 10240;

	mapCache = {};
	len = 0;

	setFile(_file:Blob){
		this.file = _file;
		this.mapCache = {};
		this.len = this.file.size;
	}

	async getch(idx:number){
		if(!this.file) {
			return "";
		}
		if(idx< 0 || idx >= this.file.size) {
			return "";
		}

		var sliceIdx = this.getSlice(idx);
		if(!(sliceIdx in this.mapCache)) {
			await this.readSlice(sliceIdx);
		}

		if(!(sliceIdx in this.mapCache)) {
			return "";
		}

		var data = this.mapCache[sliceIdx];
		var subIdx = idx - sliceIdx * this.sliceCount;
		if(subIdx < 0) {
			return "";
		}
		return data.data.charCodeAt(subIdx);
	}

	async getArray(idx:number, len:number) {
		if(!this.file) {
			return [];
		}
		if(idx < 0 || len <= 0 || idx + len >= this.file.size) {
			return [];
		}

		var rst = [];
		for(var i = 0; i < len; ++i) {
			var sliceIdx = this.getSlice(idx + i);
			if(!(sliceIdx in this.mapCache)) {
				await this.readSlice(sliceIdx);
			}

			if(!(sliceIdx in this.mapCache)) {
				return [];
			}

			var data = this.mapCache[sliceIdx];
			var subIdx = idx + i - sliceIdx * this.sliceCount;
			if(subIdx < 0) {
				return [];
			}
			rst.push(data.data.charCodeAt(subIdx));
		}
		return rst;
	}

	clear() {
		this.file = null;
		this.mapCache = {};
		this.len = 0;
	}

	private async readSlice(sliceIdx:number) {
		var local = this;
		return new Promise(rsv => {
			var idx = sliceIdx * this.sliceCount;
			var end = idx + this.sliceCount;
			if (end >= this.file.size) {
				end = this.file.size;
			}

			var slice = this.file.slice(idx, end);

			var reader = new FileReader();
			reader.onloadend = function (evt) {
				// console.info("111", evt);
				var rst = evt.target.result;
				local.mapCache[sliceIdx] = { data:rst };
				rsv();
			}
			reader.readAsBinaryString(slice);
		});
	}

	private getSlice(idx:number) {
		return Math.floor(idx / this.sliceCount);
	}
}