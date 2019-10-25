import MainRouter from "./router/MainRouter";
import VueInit from './VueInit';

// import 'src/assets/css/style.scss';
// import GlCtl from "src/control/GlCtl";
// import MainModel from './model/MainModel';

// declare var $: any;

// export default class MainHome {
// 	divBox = null;

// 	glCtl: GlCtl = new GlCtl();

// 	run() {
// 		this.divBox = $("#app")[0];

// 		// this.glCtl.md = MainModel.ins.glModel;

// 		this.glCtl.init(this.divBox);

// 		var md = MainModel.ins;

// 		md.glRes.init();

// 		md.allCellMd.colCount = 6;
// 		md.allCellMd.rowCount = 6;
// 		md.allCellMd.create();
// 		// console.info(md.allCellMd.arrData);

// 		// md.landMd.pos.x = 100;
// 		// md.landMd.pos.y = 200;
// 		md.landMd.init();

// 		this.initEvent();

// 		this.resize();

// 		this.glCtl.animate();
// 	}

// 	// isDown = false;
// 	mousePos = { x: 0, y: 0 };
// 	downPos = { x: 0, y: 0 };
// 	isMouseMove = false;
// 	initEvent() {
// 		document.oncontextmenu = function (e) {
// 			return false;
// 		}

// 		$(window).resize(() => this.resize());
// 		// $(this.divBox).mousedown((evt) => this.glCtl.mousedown(evt.clientX, evt.clientY, evt.which));
// 		// $(this.divBox).mousemove((evt) => this.glCtl.mousemove(evt.clientX, evt.clientY));
// 		// $(this.divBox).mouseup((evt) => this.glCtl.mouseup(evt.clientX, evt.clientY, evt.which));
// 		$(this.divBox).on('vmousedown', (evt) => this.mousedown(evt));
// 		$(this.divBox).on('vmousemove', (evt) => this.mousemove(evt));
// 		$(this.divBox).on('vmouseup', (evt) => this.mouseup(evt));
// 		$(this.divBox).on("taphold", (evt) => this.taphold(evt));
// 	}

// 	// click(){

// 	// }

// 	mousedown(evt){
// 		this.downPos.x = evt.clientX;
// 		this.downPos.y = evt.clientY;
// 		// this.isDown = true;
// 		this.isMouseMove = false;
		
// 		this.glCtl.mousedown(evt.clientX, evt.clientY, evt.which);
// 	}

// 	taphold(evt){
// 		if(this.isMouseMove){
// 			return;
// 		}
// 		this.glCtl.taphold(this.downPos.x, this.downPos.y);
// 	}

// 	mousemove(evt){
// 		this.mousePos.x = evt.clientX;
// 		this.mousePos.y = evt.clientY;

// 		var gapX = Math.abs(this.downPos.x - evt.clientX);
// 		var gapY = Math.abs(this.downPos.y - evt.clientY);
// 		var testLen = 1;
// 		if (gapX > testLen || gapY > testLen) {
// 			this.isMouseMove = true;
// 		}

// 		this.glCtl.mousemove(evt.clientX, evt.clientY);
// 	}

// 	mouseup(evt){
// 		// this.isDown = false;
// 		this.glCtl.mouseup(evt.clientX, evt.clientY, evt.which);
// 	}

// 	resize() {
// 		var w = $(this.divBox).width();
// 		var h = $(this.divBox).height();

// 		this.glCtl.resize(w, h);

// 		var md = MainModel.ins;
// 		md.landMd.resize(w, h);

// 	}
// }

// var mainHome = new MainHome();
// window["mainHome"] = mainHome;

// $(function () {
// 	mainHome.run();
// });

var app = new VueInit();
MainRouter.ins.init();
var router = MainRouter.ins.router;
app.run(router);