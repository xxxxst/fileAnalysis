
// 状态管理与监听
// 使用@Status声明一个状态
// 使用@StatusWatch监听状态的变化(需要@ClassInstance)
// 使用@BindStatus将状态绑定到当前对象(需要@ClassInstance)

import ClassInstance from "./ClassInstance";

// 声明状态
// 声明@Status的属性不能使用@Watch监听
// @Status state=false;
// @Status() state=false;
export function Status(target?: any, key?: any): any {
	var watchAttrName = "__$mapWatch";
	var bindAttrName = "__$arrBind";

	function updateStatus(arrFun, oldValue, value) {
		var arrRemoveIdx = [];

		for (var i = 0; i < arrFun.length; ++i) {
			var option = arrFun[i].option;
			var isLazy = false;
			if ("lazy" in option) {
				isLazy = option.lazy;
			}
			var isOnce = false;
			if ("once" in option) {
				isOnce = option.once;
			}

			if (!isLazy || oldValue !== value) {
				arrFun[i].fun.call(arrFun[i].obj, value);
				if (isOnce) {
					arrRemoveIdx.push(i);
				}
			}

		}
		for (var i = arrRemoveIdx.length - 1; i >= 0; --i) {
			arrFun.splice(arrRemoveIdx[i], 1);
		}
	}

	function create(targetSub: any, keySub: any) {
		var createSet = function (this: any, value: any) {
			var val = value;
			if(!(watchAttrName in this)){
				var temp1 = {};
				Object.defineProperty(this, watchAttrName, {
					enumerable: true,
					configurable: true,
					get: () => { return temp1; },
					set: (value: any) => { temp1 = value; },
				});
			}
			var watch = this[watchAttrName] || (this[watchAttrName] = {});
			if(!(keySub in watch)){
				var temp2 = [];
				Object.defineProperty(watch, keySub, {
					enumerable: true,
					configurable: true,
					get: () => { return temp2; },
					set: (value: any) => { temp2 = value; },
				});
			}
			var arrFun = watch[keySub] || (watch[keySub] = []);
			if(!(bindAttrName in this)){
				var temp3 = [];
				Object.defineProperty(this, bindAttrName, {
					enumerable: true,
					configurable: true,
					get: () => { return temp3; },
					set: (value: any) => { temp3 = value; },
				});
			}
			var arrBind = this[bindAttrName] || (this[bindAttrName] = []);

			var get = function () { return val; };
			var set = function (this: any, value: any) {
				var oldValue = val;
				val = value;
				updateStatus(arrFun, oldValue, value);

				// update bind watch
				for (var i = 0; i < arrBind.length; ++i) {
					var obj = arrBind[i].obj;
					var key = arrBind[i].key;

					if (!(watchAttrName in obj)) {
						continue;
					}
					if (!(key in obj[watchAttrName])) {
						continue;
					}

					updateStatus(obj[watchAttrName][key], oldValue, value);
				}
			};

			Object.defineProperty(this, keySub, {
				enumerable: true,
				configurable: true,
				get: get,
				set: set,
			});
		};

		Object.defineProperty(targetSub, keySub, {
			enumerable: true,
			configurable: true,
			set: createSet,
		});
	}

	if (key != null) {
		create(target, key);
		return;
	}

	return create;
}

// 绑定状态
// @ClassInstance local=this; 
// @BindStatus(()=>fun, name) targetStatus;
// targetFun 获取状态对象函数，或当前对象的函数名
// name 状态名
export function BindStatus(targetFun: Function | string, name?: string): any {
	var bindAttrName = "__$arrBind";

	function create(targetSub: any, keySub: any, descriptor) {
		ClassInstance(targetSub, function (this: any) {
			// this.onChanged = ()=>3;

			var target = null;
			if (typeof (targetFun) == "string") {
				// if (typeof (this[targetFun]) != "function") {
				// 	target = this;
				// 	name = targetFun;
				// } else {
				// 	target = this[targetFun]();
				// }

				var arr = targetFun.split(".");
				target = this;
				for(var i = 0; i < arr.length - 1; ++i){
					target = target[arr[i]];
				}
				targetFun = arr[arr.length-1];
				if (typeof (target[targetFun]) != "function") {
					name = targetFun;
				} else {
					target = target[targetFun]();
				}
				
			} else {
				target = targetFun.call(this);
			}
			// var target = targetFun.call(this);
			if(!(bindAttrName in target)){
				var arrTemp = [];
				Object.defineProperty(target, bindAttrName, {
					enumerable: true,
					configurable: true,
					get: () => { return arrTemp; },
					set: (value: any) => { arrTemp = value; },
				});
			}
			var arrBind = target[bindAttrName] || (target[bindAttrName] = []);
			arrBind.push({ obj: this, key: keySub });

			Object.defineProperty(this, keySub, {
				enumerable: true,
				configurable: true,
				get: () => { return target[name]; },
				set: (value: any) => { target[name] = value; },
			});
		});
	}

	return create;
}

export class WatchOption {
	lazy?= false;
	once?= false;
	atOnce?= false;
}

// 在需要监听的地方使用
// @ClassInstance local=this; 
// @StatusWatch(()=>statusObject, strName, option) onUpdate(newValue){ }
// @StatusWatch("getStatusFunName") onUpdate(newValue){ }
// @StatusWatch("statusName") onUpdate(newValue){ }
// targetFun 类型为函数，返回状态所在对象，类型为字符串，为当前类的函数名或当前类的状态名
// name 状态属性名
// option 可选参数
//   lazy：惰性模式，只有在状态不一样时更新，默认为false
//   once：只执行一次，默认为flase
//   atOnce：立即，绑定后立即执行
export function WatchStatus(targetFun: Function | string, name?: any, option?: WatchOption): any {
	var watchAttrName = "__$mapWatch";

	function create(targetSub: any, keySub: any, descriptor) {
		ClassInstance(targetSub, function (this: any) {
			// this.onChanged = ()=>3;
			// console.info("33", this);
			option = option || new WatchOption();

			var target = null;
			if (typeof (targetFun) == "string") {
				var arr = targetFun.split(".");
				target = this;
				for(var i = 0; i < arr.length - 1; ++i){
					target = target[arr[i]];
				}
				targetFun = arr[arr.length-1];
				if (typeof (target[targetFun]) != "function") {
					// target = this;
					option = name || new WatchOption();
					name = targetFun;
				} else {
					target = target[targetFun]();
				}
			} else {
				target = targetFun.call(this);
			}
			// var target = targetFun.call(this);

			if(!(watchAttrName in target)){
				var objTemp = {};
				Object.defineProperty(target, watchAttrName, {
					enumerable: true,
					configurable: true,
					get: () => { return objTemp; },
					set: (value: any) => { objTemp = value; },
				});
			}
			var watch = target[watchAttrName] || (target[watchAttrName] = {});
			if(!(name in watch)){
				var arrTemp = [];
				Object.defineProperty(watch, name, {
					enumerable: true,
					configurable: true,
					get: () => { return arrTemp; },
					set: (value: any) => { arrTemp = value; },
				});
			}
			var arrFun = watch[name] || (watch[name] = []);

			if ("atOnce" in option && option.atOnce) {
				this[keySub].call(this, target[name]);

				if ("once" in option && option.once) {
					return;
				}
			}

			arrFun.push({ fun: this[keySub], obj: this, option: option });
			// console.info("22", target);
		});

	}

	return create;
}