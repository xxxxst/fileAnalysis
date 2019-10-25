
//SFilter-filter装饰器
//必须使用SComponent替换Component
//filter函数必须为static类型

import Vue, { ComponentOptions } from "vue";
import Component from "vue-class-component";

export function SComponent<V extends Vue>(options: ComponentOptions<V> & ThisType<V>): any {
	function create(target){
		var filterName = "$_s_filters_";
		if(filterName in target){
			var filters = options.filters || (options.filters={});

			for(var key in target[filterName]){
				filters[key] = target[filterName][key];
			}
		}
		return Component(options)(target);
	}
	return create;
}

export function SFilter(target: any, key?: any, descriptor?: any): any {
	var targetKey = target;

	function create(targetSub, keySub, descriptor?: any, dd?:any){
		var filterName = "$_s_filters_";
		// console.info("ee", targetSub, keySub, descriptor, dd);

		var filter = targetSub[filterName] || (targetSub[filterName]={});
		if(keySub in targetSub){
			filter[targetKey] = targetSub[keySub];
		}
	}

	// @Des
	// console.info("bb", target);
	if (key != null) {
		targetKey = key;
		create(target, key, {value:target[key]});
		return;
	}

	// @Des(...args)
	return create;
}