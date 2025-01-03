
export default class TablCtl {
	// el: HTMLElement = null;
	selectIdx = 0;
	// mapItem = {};

	bindElement(_el) {
		
	}

	onClickHeader(idx) {
		this.selectIdx = idx;
	}

	select(idx){
		this.selectIdx = idx;
	}
}