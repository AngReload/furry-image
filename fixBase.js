'use strict';
function fixBase(base, n, m) {
	n = n || 2;
	m = m || n;
	let width = this.width;
	let height = this.height;
	let fixed = new this.constructor(width, height, this.components);
	base.forEach((v, c, w, h) => {
		let hm = h * m;
		let wn = w * n;
		let submartix = [];
		for (let y = 0; y < m; y++) {
		for (let x = 0; x < n; x++) {
			submartix[x + y * n] = this.get(c, wn + x, hm + y, v);
		}}
		let summ = submartix.reduce((a, b) => a + b);
		let total = v * n * m;
		if (summ > total) {
			let k = total / summ;
			submartix = submartix.map(value => value * k);
		} else if (summ < total) {
			let anti_matrix = submartix.map(value => 255 - value);
			let anti_summ = anti_matrix.reduce((a, b) => a + b);
			let anti_total = 255 * n * m - total;
			let k = anti_total / anti_summ;
			submartix = anti_matrix.map(anti_value => 255 - anti_value * k);
		}
		for (let y = 0; y < m; y++) {
		for (let x = 0; x < n; x++) {
			fixed.set(c, wn + x, hm + y, submartix[x + y * n]);
		}}
	});
	return fixed;
}
module.exports = fixBase;