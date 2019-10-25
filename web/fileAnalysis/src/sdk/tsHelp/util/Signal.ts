
export interface ISignal {
	isActivate;

	// outTo(signal:ISignal);
	listen(fun: Function);
	listenOutSignal(fun: Function);
}

export abstract class BaseMultiSignal implements ISignal {
	protected inputSignal: ISignal[] = null;
	protected cacheStatus = false;
	protected arrFun = [];
	protected arrOutSignalFun = [];

	get isActivate() {
		return this.cacheStatus;
	}

	setInput(signal: ISignal) {
		this.inputSignal.push(signal);
		signal.listenOutSignal(this.onInputChanged);

		this.onInputChanged();
	}

	protected abstract onInputChanged();

	listenOutSignal(fun: Function) {
		this.arrOutSignalFun.push(fun);
	}

	listen(fun: Function) {
		if (this.cacheStatus) {
			fun();
		} else {
			this.arrFun.push(fun);
		}
	}

	protected send() {
		for (var i = 0; i < this.arrOutSignalFun.length; ++i) {
			this.arrOutSignalFun[i]();
		}

		var arr = this.arrFun;
		this.arrFun = [];
		for (var i = 0; i < arr.length; ++i) {
			arr[i]();
		}
	}

}

export class AndSignal extends BaseMultiSignal {
	// private inputSignal:ISignal[] = null;
	// // private outSignal = [];
	// private cacheStatus = false;
	// private arrFun = [];

	// get isActivate(){
	// 	return this.cacheStatus;
	// }

	// setInput(signal:ISignal){
	// 	this.inputSignal.push(signal);
	// 	signal.listen(this.onInputChanged);
	// }

	protected onInputChanged() {
		var isActivate = true;
		for (var i = 0; i < this.inputSignal.length; ++i) {
			if (!this.inputSignal[i].isActivate) {
				isActivate = false;
				break;
			}
		}
		if (this.cacheStatus == isActivate) {
			return;
		}
		this.cacheStatus = isActivate;
		this.send();
	}

	// listen(fun:Function){
	// 	this.arrFun.push(fun);
	// 	if(this.cacheStatus){
	// 		fun();
	// 	}
	// }

	// send(){
	// 	for(var i = 0; i < this.arrFun.length; ++i){
	// 		this.arrFun[i]();
	// 	}
	// }
}

export class OrSignal extends BaseMultiSignal {
	protected onInputChanged() {
		var isActivate = false;
		for (var i = 0; i < this.inputSignal.length; ++i) {
			if (this.inputSignal[i].isActivate) {
				isActivate = true;
				break;
			}
		}
		if (this.cacheStatus == isActivate) {
			return;
		}
		this.cacheStatus = isActivate;
		this.send();
	}
}

export abstract class BaseSignal implements ISignal {
	protected inputSignal: ISignal = null;
	// private outSignal = [];
	protected cacheStatus = false;
	protected arrFun = [];
	protected arrOutSignalFun = [];

	get isActivate() {
		return this.cacheStatus;
	}

	set isActivate(value) {
		if (this.inputSignal != null) {
			return;
		}
		if (this.cacheStatus == value) {
			return;
		}
		this.cacheStatus = value;
		this.send();
	}

	setInput(signal: ISignal) {
		this.inputSignal = signal;
		signal.listenOutSignal(this.onInputChanged);

		this.onInputChanged();
	}

	listenOutSignal(fun: Function) {
		this.arrOutSignalFun.push(fun);
	}

	protected abstract onInputChanged();

	listen(fun: Function) {
		if (this.cacheStatus) {
			fun();
		} else {
			this.arrFun.push(fun);
		}
	}

	protected send() {
		for (var i = 0; i < this.arrOutSignalFun.length; ++i) {
			this.arrOutSignalFun[i]();
		}

		var arr = this.arrFun;
		this.arrFun = [];
		for (var i = 0; i < arr.length; ++i) {
			arr[i]();
		}
	}
}

export default class Signal extends BaseSignal {
	protected onInputChanged() {
		if (this.cacheStatus == this.inputSignal.isActivate) {
			return;
		}
		this.cacheStatus = this.inputSignal.isActivate;
		this.send();
	}
}

export class NotSignal extends BaseSignal {
	protected onInputChanged() {
		if (this.cacheStatus != this.inputSignal.isActivate) {
			return;
		}
		this.cacheStatus = !this.inputSignal.isActivate;
		this.send();
	}
}

// export class OnceSignal implements ISignal{
// 	protected inputSignal:ISignal = null;
// 	// private outSignal = [];
// 	protected cacheStatus = false;
// 	protected arrFun = [];
// 	protected arrOutSignalFun = [];

// 	get isActivate(){
// 		return this.cacheStatus;
// 	}

// 	set isActivate(value){
// 		if(this.inputSignal != null){
// 			return;
// 		}
// 		if(this.cacheStatus == true || value == false){
// 			return;
// 		}
// 		this.cacheStatus = value;
// 		this.send();
// 	}

// 	setInput(signal:ISignal){
// 		this.inputSignal = signal;
// 		signal.listenOutSignal(this.onInputChanged);

// 		this.onInputChanged();
// 	}

// 	listenOutSignal(fun:Function){
// 		this.arrOutSignalFun.push(fun);
// 	}

// 	protected onInputChanged(){
// 		if(this.cacheStatus == true || this.inputSignal.isActivate == false){
// 			return;
// 		}
// 		this.cacheStatus = this.inputSignal.isActivate;
// 		this.send();
// 	}

// 	listen(fun:Function){
// 		if(this.cacheStatus){
// 			return;
// 		}else{
// 			this.arrFun.push(fun);
// 		}
// 	}

// 	protected send(){
// 		for(var i = 0; i < this.arrOutSignalFun.length; ++i){
// 			this.arrOutSignalFun[i]();
// 		}

// 		var arr = this.arrFun;
// 		this.arrFun = [];
// 		for(var i = 0; i < arr.length; ++i){
// 			arr[i]();
// 		}
// 	}

// }
