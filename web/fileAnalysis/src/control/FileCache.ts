
export default class FileCache {
	file: Blob = null;
	sliceCount = 10240;

	mapCache = {};

	setFile(_file:Blob){
		this.file = _file;
		this.mapCache = {};
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

	clear() {
		this.file = null;
		this.mapCache = {};
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