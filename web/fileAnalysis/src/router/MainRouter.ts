
import VueRouter from "vue-router";
import Home from 'src/components/page/home/Home.vue';

const routes = [
	{ path: '/', component: Home, props: true},
];

export default class MainRouter {
	static ins: MainRouter = new MainRouter();

	router: VueRouter = null;
	init() {
		this.router = new VueRouter({
			routes
		});
	}
}
