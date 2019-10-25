
interface $Rst {
	hasClass(className:string):boolean;
	addClass(className:string):$Rst;
	removeClass(className:string):$Rst;
	resize(cb:any):$Rst;
	on(type:string, cb:any):$Rst;
	off(type:string, cb:any):$Rst;
	width():number;
	height():number;
	append(ele:any):any;
	html(str:any):any;
	offset():{top:number,left:number};
	position():{top:number,left:number};
	find(searchText:string):any;
	children(searchText:string):any;
	click(cb:Function):any;
	text():string;
	css(nam:string, value?:any):string;
	attr(nam:string, value?:any):string;
	animate(obj:any, speed?:number|'slow'|'normal'|'fast', easing?:'swing'|'linear', cb?:Function);
	val(text?:string):string;
}

interface $Jquery {
	(any):$Rst;
	
	cookie(key:string, val:string, option?:{expires?:number, path?:string}):void;
	cookie(key:string):string;
	extend(obj:any, oldObj:any);
	extend(isDeep:boolean, obj:any, oldObj:any);
	ajax(option:{
		url:string,
		dataType?:string,
		async?:boolean,
		cache?:boolean,
		success?:Function,
	});
}

declare var $: $Jquery;

// export default $;