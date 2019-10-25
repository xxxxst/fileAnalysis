
//virtual mouse event
import Vue from "vue";

export default class VueVEvent {
	static longDownWaitTime = 400;

	static install(vue: Vue, options) {
		Vue.directive('vmouse', {
			bind: function (el, data, tag: any) {
				var name = data.rawName;
				name = name.match(/(?::)(.*)/)[1] || "";
				// data.value = ()=>{};
				if (VueVEvent.isPC()) {
					switch (name) {
						case "down": VueVEvent.listen(el, "mousedown", VueVEvent.onmousedown, data, tag); break;
						case "move": VueVEvent.listen(el, "mousemove", VueVEvent.onmousemove, data, tag); break;
						case "up": VueVEvent.listen(el, "mouseup", VueVEvent.onmouseup, data, tag); break;
						case "click": {
							VueVEvent.listen(el, "mousedown", VueVEvent.onmousedownClick, data, tag);
							VueVEvent.listen(el, "mouseup", VueVEvent.onmouseupClick, data, tag);
							window.addEventListener("mouseup", evt => VueVEvent.onmouseupGlobalClick(evt, el, data, tag));
							break;
						}
						case "longdown": VueVEvent.longMouseDown(el, data, tag); break;
					}
				} else {
					switch (name) {
						case "down": VueVEvent.listen(el, "touchstart", VueVEvent.ontouchstart, data, tag); break;
						case "move": VueVEvent.listen(el, "touchmove", VueVEvent.ontouchmove, data, tag); break;
						case "up": VueVEvent.listen(el, "touchend", VueVEvent.ontouchend, data, tag); break;
						case "click": {
							VueVEvent.listen(el, "touchstart", VueVEvent.ontouchstartClick, data, tag);
							VueVEvent.listen(el, "touchend", VueVEvent.ontouchendClick, data, tag);
							window.addEventListener("touchend", evt => VueVEvent.onmouseupGlobalClick(evt, el, data, tag));
							break;
						}
						case "longdown": VueVEvent.longTouch(el, data, tag); break;
					}
				}
			},
		});
	}

	static listen(el, funName, fun, data, tag) {
		el.addEventListener(funName, evt => fun.call(VueVEvent, evt, el, data, tag));
	}

	static isPC() {
		const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;

		if ((navigator.userAgent.match(reg))) {
			return false;
		} else {
			return true
		}
	}

	static dealEvt(evt) {
		var touch = evt.touches && evt.touches[0];
		var newEvent: any = { which: 1, originalEvent: evt, touches: evt.touches, stopPropagation: ()=>evt.stopPropagation() };
		if (evt.touches.length > 1) {
			newEvent.which = 100 + evt.touches.length;
		}
		if (touch != null) {
			newEvent.clientX = touch.clientX;
			newEvent.clientY = touch.clientY;
			newEvent.pageX = touch.pageX;
			newEvent.pageY = touch.pageY;
			newEvent.screenX = touch.screenX;
			newEvent.screenY = touch.screenY;
			newEvent.radiusX = touch.radiusX;
			newEvent.radiusY = touch.radiusY;
		}

		return newEvent;
	}

	// static dealRst(rst, evt, data, tag){

	// }

	static longMouseDown(el, data, tag) {
		var timerId:any = -1;
		var isUp = false;
		el.addEventListener("mousedown", evt => {
			isUp = false;
			timerId = setTimeout(() => {
				timerId = -1;
				if (isUp) {
					return;
				}

				data.value && data.value.call(tag, evt);
			}, VueVEvent.longDownWaitTime);
		});
		el.addEventListener("mouseup", evt => {
			isUp = true;
			if (timerId >= 0) {
				clearTimeout(timerId);
				timerId = -1;
			}
		});
	}

	static longTouch(el, data, tag) {
		var timerId:any = -1;
		var isUp = false;
		el.addEventListener("touchstart", evt => {
			isUp = false;
			timerId = setTimeout(() => {
				timerId = -1;
				if (isUp) {
					return;
				}

				var newEvent = VueVEvent.dealEvt(evt);
				data.value && data.value.call(tag, newEvent);
			}, VueVEvent.longDownWaitTime);
		});
		el.addEventListener("touchend", evt => {
			isUp = true;
			if (timerId >= 0) {
				clearTimeout(timerId);
				timerId = -1;
			}
		});
	}

	static onmousedown(evt, el, data, tag) {
		data.value && data.value.call(tag, evt);
	}

	static onmousedownClick(evt, el, data, tag) {
		el.__vue_vevent_isdown = true;
		// data.value && data.value.call(tag, evt);
	}

	static onmousemove(evt, el, data, tag) {
		data.value && data.value.call(tag, evt);
	}

	static onmouseup(evt, el, data, tag) {
		data.value && data.value.call(tag, evt);
	}

	static onmouseupClick(evt, el, data, tag) {
		if (!el.__vue_vevent_isdown) {
			return;
		}
		el.__vue_vevent_isdown = false;
		data.value && data.value.call(tag, evt);
	}

	static onmouseupGlobalClick(evt, el, data, tag) {
		el.__vue_vevent_isdown = false;
	}

	static ontouchstart(evt, el, data, tag) {
		var newEvent = VueVEvent.dealEvt(evt);
		data.value && data.value.call(tag, newEvent);
	}

	static ontouchstartClick(evt, el, data, tag) {
		el.__vue_vevent_isdown = true;
	}

	static ontouchmove(evt, el, data, tag) {
		var newEvent = VueVEvent.dealEvt(evt);
		data.value && data.value.call(tag, newEvent);
	}

	static ontouchend(evt, el, data, tag) {
		var newEvent = VueVEvent.dealEvt(evt);
		data.value && data.value.call(tag, newEvent);
	}

	static checkIsOver(el, nowEl){
		return el == nowEl || (nowEl.parentElement && this.checkIsOver(el, nowEl.parentElement));
	}

	static ontouchendClick(evt, el, data, tag) {
		// console.info(el.__vue_vevent_isdown, el);
		// console.info(el.__vue_vevent_isdown, evt);
		try {
			var endTarget = document.elementFromPoint(
				evt.changedTouches[0].pageX,
				evt.changedTouches[0].pageY
			);
			// console.info(endTarget);
			if (!this.checkIsOver(el, endTarget)) {
				return;
			}
		} catch (ex) { }

		if (!el.__vue_vevent_isdown) {
			return;
		}
		el.__vue_vevent_isdown = false;
		var newEvent = VueVEvent.dealEvt(evt);
		data.value && data.value.call(tag, newEvent);
	}
}
