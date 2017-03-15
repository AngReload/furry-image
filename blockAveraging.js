'use strict';
const ceil = Math.ceil;

function blockAveraging(n, m) {
	n = n || 2;
	m = m || n;
	let ratio = 1 / (n * m);
	let width = ceil(this.width / n);
	let height = ceil(this.height / m);
	let getter = (v, c, w, h) => {
		let integral = 0;
		let hm = h * m;
		let wn = w * n;
		for (let y = 0; y < m; y++) {
		for (let x = 0; x < n; x++) {
			integral += this.get(c, wn + x, hm + y);
		}}
		return integral * ratio;
	};
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = blockAveraging;