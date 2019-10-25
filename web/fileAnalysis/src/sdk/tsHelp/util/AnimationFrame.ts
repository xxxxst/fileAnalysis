
export default class AnimationFrame {
	id = -1;
	callback = null;
	private _isRun = false;

	constructor(_callback = null) {
		this.callback = _callback;
	}

	isRun() {
		return this.id >= 0;
	}

	run() {
		if (this.id >= 0) {
			// AnimationFrame.cancelAnimationFrame(this.id);
			// this.id = -1;
			return;
		}

		this._isRun = true;
		// AnimationFrame.requestAnimationFrame(()=>this.onUpdate);
		this.onUpdate();
	}

	onUpdate(){
		if(!this._isRun){
			return;
		}
		if(this.callback != null){
			this.callback();
		}
		AnimationFrame.requestAnimationFrame(()=>this.onUpdate());
		// var local = this;
		// AnimationFrame.requestAnimationFrame(function(){local.onUpdate();});
	}

	stop() {
		this._isRun = false;
		if (this.id < 0) {
			return;
		}
		AnimationFrame.cancelAnimationFrame(this.id);
		this.id = -1;
	}

	static get requestAnimationFrame() {
		var raf = window.requestAnimationFrame
			|| window["mozRequestAnimationFrame "]
			|| window["webkitRequestAnimationFrame"]
			|| function (fn) { return window.setTimeout(fn, 20); };

		return function (fn) { return raf(fn) };
		// return raf;
	}

	static get cancelAnimationFrame() {
		var cancel = window.cancelAnimationFrame
			|| window["mozCancelAnimationFrame"]
			|| window["webkitCancelAnimationFrame"]
			|| window.clearTimeout;

		return function (id) { return cancel(id); };
		// return cancel;
	}
}
