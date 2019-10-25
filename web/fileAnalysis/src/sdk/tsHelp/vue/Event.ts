
// 事件
// Event.listen 监听事件
// Event.send 发送事件
// @SEvtListen 监听事件

import Vue from "vue";
import Component, { createDecorator } from 'vue-class-component';
import ClassInstance from '../util/ClassInstance';

export default class Event{
	lstFun = [];

	listen(fun:Function){
		this.lstFun.push(fun);
	}

	listenWithObj(obj:Object, fun:Function){
		this.lstFun.push({obj:obj, fun:fun});
	}

	send(...args){
		for(var i = 0; i < this.lstFun.length; ++i){
			if(typeof(this.lstFun[i]) == "object"){
				// console.info("send1");
				this.lstFun[i].fun.call(this.lstFun[i].obj, ...args);
			}else{
				this.lstFun[i](...args);
			}
		}
	}
}

// 事件监听装饰器
// 对象不为vue组件时，需要使用 @ClassInstance local = this; 进行初始化
export function SEvtListen(getEventFun: Function | string){
	function create(targetSub, keySub, descriptor?: any){
		//is vue
		if(targetSub instanceof Vue){
			createDecorator((componentOptions, handler)=>{
				var mixins = componentOptions.mixins||(componentOptions.mixins=[]);
				mixins.push({
					data: function () {
						// component = this;
						if(typeof(getEventFun) == "string"){
							this[getEventFun]().listenWithObj(this, targetSub[keySub]);
						}else{
							getEventFun.call(this).listenWithObj(this, targetSub[keySub]);
						}
						// console.info("33", this, Component);
						return {};
					}
				});

			})(targetSub, keySub, descriptor);

			return;
		}

		// getEventFun().listenWithObj(targetSub, targetSub[keySub]);
		ClassInstance(targetSub, function(this:any){
			if(typeof(getEventFun) == "string"){
				this[getEventFun]().listenWithObj(this, this[keySub]);
			}else{
				getEventFun.call(this).listenWithObj(this, this[keySub]);
			}
		});
	}

	return create;
}
