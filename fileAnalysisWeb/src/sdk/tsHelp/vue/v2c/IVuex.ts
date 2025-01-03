
/** v3 */
// export { createStore, Store } from 'vuex';

/** v2 */
import Vuex, { StoreOptions } from 'vuex';
export { Store } from 'vuex';

export function createStore<S>(options: StoreOptions<S>) {
	return new Vuex.Store(options);
}