
import Vue from "vue";
import Component, { createDecorator } from 'vue-class-component';

export function EProp(defValue = null, propName = "inputData"){

	function create(targetSub: any, keySub: any, descriptor?: any) {
		createDecorator((componentOptions, handler) => {
			var mixins = componentOptions.mixins || (componentOptions.mixins = []);
			
			mixins.push({
				data: function () {
					var local = this;
					Object.defineProperty(local, keySub, {
						enumerable: true,
						configurable: true,
						get: () => {
							if(!(keySub in local[propName])){
								return defValue;
							}
							return local[propName][keySub];
						},
						set: (value: any) => { local[propName][keySub] = value; },
					});

					return {};
				}
			});

		})(targetSub, keySub, descriptor);
	};

	return create;
}