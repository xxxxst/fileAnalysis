
import { createRouter, createWebHashHistory, RouteRecordRaw } from '@/sdk/tsHelp/vue/v2c/IVueRouter';

import Home from '@/components/page/home/Home.vue';

const routes = [
	{ path: '/', component: Home, props: true},
];

export default new class MainRouter {
	create() {
		return createRouter({
			history: createWebHashHistory(),
			routes,
		});
	}
}
