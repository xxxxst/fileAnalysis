
export default class DataCtl {
	db: IDBDatabase = null;

	async init() {
		var ok = await this.open();
		return ok;
	}

	private async open() {
		const dbName = "fileAnalysis";
		const version = 1;
		const storeName = "data";
		const pkeyName = "id";

		return new Promise<boolean>((rsv) => {
			var req = indexedDB.open(dbName, version);
			req.onerror = (evt: any) => {
				this.db = null;
				rsv(false);
			}
			req.onsuccess = (evt: any) => {
				this.db = evt.target.result as IDBDatabase;
				rsv(true);
			}
			req.onupgradeneeded = (evt: any) => {
				var db = evt.target.result as IDBDatabase;

				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath: pkeyName });
				}
			}
		});
	}

	async loadData(id: string) {
		// const id = "config";
		var rst = await this.query(id);
		if (!rst) {
			return null;
		}
		return rst.content as string;
	}

	async saveData(id: string, content: string) {
		const pkeyName = "id";

		// const id = "config";
		await this.setData({
			[pkeyName]: id,
			content: content
		});
	}

	private async setData(data) {
		const storeName = "data";

		if (!this.db) {
			return false;
		}

		return new Promise<boolean>((rsv) => {
			var tr = this.db.transaction([storeName], "readwrite");
			var store = tr.objectStore(storeName);
			var req = store.put(data);

			req.onerror = (evt: any) => {
				rsv(false);
			}
			req.onsuccess = (evt: any) => {
				rsv(true);
			};
		});
	}

	private async query(id) {
		const storeName = "data";

		if (!this.db) {
			return null;
		}

		return new Promise<any>((rsv) => {
			var tr = this.db.transaction([storeName], "readonly");
			var store = tr.objectStore(storeName);
			var req = store.get(id);

			req.onerror = (evt: any) => {
				rsv(null);
			}
			req.onsuccess = (evt: any) => {
				rsv(evt.target.result);
			};
		});
	}

}
