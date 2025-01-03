
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import 'reflect-metadata';

interface IDisposable {
	dispose();
}

function SyncDefer(descriptor: PropertyDescriptor) {
	var oldFun = descriptor.value;
	var newFun = function(this:any, ...args) {
		// console.info("");
		// console.info("-----Defer fun start-----", this);
		Defer.arrDefer.push([]);

		var ex = null;
		var rst = undefined;
		try {
			rst = oldFun.apply(this, args);
		} catch(_ex) {
			ex = _ex;
		}

		var arr = Defer.arrDefer.pop();
		clearDefer(arr);
		// console.info("-----Defer fun end-----", this);

		if(ex) {
			throw ex;
		}
		return rst;
	};
	descriptor.value = newFun;
}

function AsyncDefer(descriptor: PropertyDescriptor) {
	var oldFun = descriptor.value;
	var newFun = async function(this:any, ...args) {
		// console.info("");
		// console.info("-----AsyncDefer fun start-----", this);
		Defer.arrDefer.push([]);

		var ex = null;
		var rst = undefined;
		try {
			rst = await oldFun.apply(this, args);
		} catch(_ex) {
			ex = _ex;
		}

		var arr = Defer.arrDefer.pop();
		clearDefer(arr);
		// console.info("-----AsyncDefer fun end-----", this);
		
		if(ex) {
			throw ex;
		}
		return rst;
	};
	descriptor.value = newFun;
}

function clearDefer(arr) {
	for(var i = arr.length - 1; i >= 0; --i) {
		if(typeof(arr[i]) == "function") {
			arr[i]();
		} else {
			if(typeof(arr[i].dispose) == "function") {
				arr[i].dispose();
			}
		}
	}
}

// 'design:returntype', 'design:paramtypes', 'design:type'
export function Defer(async:boolean|null=null) {
	return function(target: any, name: string, descriptor: PropertyDescriptor) {
		if(async == null) {
			var rtType = Reflect.getMetadata("design:returntype", target, name);
			async = (rtType === Promise);
		}
		if(!async) {
			SyncDefer(descriptor);
		} else {
			AsyncDefer(descriptor);
		}
	}
}

Defer.arrDefer = [];

export function defer(fun:Function|IDisposable) {
	if(Defer.arrDefer.length == 0) {
		console.error("defer() should declare decorator @Defer() first");
	}
	var last = Defer.arrDefer[Defer.arrDefer.length - 1];
	last.push(fun);
}
