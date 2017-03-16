'use strict';
const ceil = Math.ceil;

function blockAveraging(n = 2, m = n) {
	const ratio = 1 / (n * m);
	const width = ceil(this.width / n);
	const height = ceil(this.height / m);
	const getter = (v, c, w, h) => {
		let integral = 0;
		let hm = h * m;
		let wn = w * n;
		for (let y = 0; y < m; y++) {
			for (let x = 0; x < n; x++) {
				integral += this.get(c, wn + x, hm + y);
			}
		}
		return integral * ratio;
	};
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = blockAveraging;