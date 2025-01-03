
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { createDecorator, Vue } from './v2c/IVueClassComponent';

// 函数装饰器
// 覆盖组件方法，使得方法内的this引用始终指向Vue组件
function VFuncBind() {
	return (target: Vue, key: string, descriptor: any) => {
		var fun = target[key];

		createDecorator((componentOptions, handler) => {
			var mixins = componentOptions.mixins || (componentOptions.mixins = []);

			mixins.push({
				created() {
					var local = this;
					local[key] = function () {
						fun.apply(local, arguments);
					}
				}
			});
		})(target, null);
	}
}

export default VFuncBind;
