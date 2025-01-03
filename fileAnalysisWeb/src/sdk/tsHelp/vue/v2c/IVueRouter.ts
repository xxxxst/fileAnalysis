
/** v3 */
// export { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

/** v2 */
import VueRouter, { RouteConfig, RouterOptions } from 'vue-router';
export type { RouteConfig as RouteRecordRaw };

interface IRouterOptions extends RouterOptions {
	history?: any;
}

export function createWebHashHistory() {

}

export function createRouter(options?: IRouterOptions) {
	return new VueRouter(options);
}