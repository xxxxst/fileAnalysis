
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

interface $JqueryObj {
	hasClass(className: string): boolean;
	addClass(className: string): $JqueryObj;
	removeClass(className: string): $JqueryObj;
	resize(cb: any): $JqueryObj;
	on(type: string, cb: any): $JqueryObj;
	bind(type: string, cb: any): $JqueryObj;
	unbind(type: string, cb: any): $JqueryObj;
	off(type: string, cb: any): $JqueryObj;
	width(): number;
	height(): number;
	append(ele: any): any;
	offset(): { top: number, left: number };
	position(): { top: number, left: number };
	find(searchText: string): any;
	parent(): $JqueryObj;
	prev(): $JqueryObj;
	children(searchText: string): $JqueryObj;
	click(cb: Function): $JqueryObj;
	html(str?: any): any;
	text(str?:string): string;
	val(str?:string): string;
	css(nam: string, value?: any): string;
	attr(nam: string, value?: any): string;
	animate(obj: any, speed?: number | 'slow' | 'normal' | 'fast', easing?: 'swing' | 'linear', cb?: Function);
	focus();
	blur();
	keydown(cb:Function): $JqueryObj;
	keyup(cb:Function): $JqueryObj;
	keypress(cb:Function): $JqueryObj;
	select(): $JqueryObj;

	length: number;
}

interface $Jquery {
	(any):$JqueryObj;
	
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
		error?:Function,
	});
}

declare var $: $Jquery;

// export default $;
