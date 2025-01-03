
import VueInit from '@/VueInit';
import MainRouter from '@/router/MainRouter';
import MainStore from '@/store/MainStore';

(async ()=>{
	var app = new VueInit();
	await app.init();

	app.run(MainRouter.create(), MainStore.create());
})();
