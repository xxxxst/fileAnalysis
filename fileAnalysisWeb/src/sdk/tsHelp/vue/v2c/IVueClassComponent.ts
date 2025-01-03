
/** v3 */
// export { Vue, createDecorator } from 'vue-class-component';

/** v2 */
import { Vue } from './IVue2Compatibility';
export { Vue };

import type { ComponentOptions } from 'vue/types/umd';
import { createDecorator as OriginCreateDecorator } from 'vue-class-component';

interface IComponentOptions<V extends Vue> extends ComponentOptions<V> {
	destroyed?: undefined,
	beforeDestroy?: undefined,
	beforeUnmount?();
	unmounted?();
	mixins?: (IComponentOptions<Vue> | typeof Vue)[];
}

type ICreateDecorator = (factory: (options: IComponentOptions<Vue>, key: string, index: number) => void) => any;
const createDecorator = OriginCreateDecorator as ICreateDecorator;

export { createDecorator };
