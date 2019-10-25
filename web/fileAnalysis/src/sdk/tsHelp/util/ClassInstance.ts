
// 使装饰器可以在类创建之后调用
// 使用方法：
// @ClassInstance() local = this;	在构造函数之前初始化
// ClassInstance(this)				在任意位置调用后初始化
export default function ClassInstance(target?: any, key?: any, ...args): any {
	// var defTagName = "__$ClassInitFunTag";
	var arrName = "__$arrClassInitFun";
	// var isInit = !(typeof(target) == "boolean" && !target);

	function create(targetSub: any, keySub: any) {
		// targetSub[arrName] || (targetSub[arrName]=[]);
		targetSub[arrName] || (targetSub[arrName] = []);

		var createSet = function (this: any, value: any) {
			var val = value;

			var get = function () { return val; };
			var set = function (this: any, value: any) {
				val = value;
			};

			Object.defineProperty(this, keySub, {
				enumerable: true,
				configurable: true,
				get: get,
				set: set,
			});

			if (!(arrName in this)) {
				return;
			}

			// if(!isInit){
			// 	return;
			// }

			// console.info("11", this);
			var local = this;
			this[arrName].forEach(item => {
				item.fun.call(local, ...item.args);
			});
		};


		Object.defineProperty(targetSub, keySub, {
			enumerable: true,
			configurable: true,
			set: createSet,
		});
	}

	// 监听初始化完成事件
	if (typeof (key) == "function") {
		// if (!(arrName in target)) {
		// 	console.warn("not binding ClassInstance");
		// }
		
		var arr = target[arrName] || (target[arrName] = []);
		arr.push({ fun: key, args: args });
		return;
	}

	// 无参装饰器
	if (key != null) {
		create(target, key);
		return;
	}

	// 无参装饰器
	if(arguments.length == 0){
		return create;
	}
	
	// 直接调用初始化
	if(typeof(target) == "object"){
		if(!(arrName in target)){
			return;
		}
		target[arrName].forEach(item => {
			item.fun.call(target, ...item.args);
		});
	}

	// return create;
}

// 在任意位置初始化装饰器
// @ClassInstance(false) local = this;
// constructor(){ /*your code*/ DecoratorInit(tihs); }
// export function DecoratorInit(obj:object){
// 	var arrName = "__$arrClassInitFun";
// 	if(!(arrName in obj)){
// 		return;
// 	}
// 	obj[arrName].forEach(item => {
// 		item.fun.call(obj, ...item.args);
// 	});
// }