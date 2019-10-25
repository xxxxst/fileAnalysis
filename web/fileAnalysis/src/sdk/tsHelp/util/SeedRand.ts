
// 带种子的伪随机数

export default class SeedRand {
	private seed = 0;
	private data = 0;
	private a = 3;
	private b = 521;
	private m = (1 << 31) - 1;

	constructor(_seed = 0) {
		this.seed = _seed;

		var temp = Math.floor(this.m / 2 + this.seed) % this.m;
		this.data = (temp * this.a + this.b) % this.m;
	}

	rand(): number {
		// var m = Number.MAX_VALUE;
		this.data = (this.data * this.a + this.b) % this.m;
		// console.info(this.data, this.data / this.m);
		return (this.data / this.m);
	}
}