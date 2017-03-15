'use strict';
function multiplyTrivial(n, m) {
	n = n || 2;
	m = m || n;
	let width = this.width * n;
	let height = this.height * m;
	let image = new this.constructor(width, height, this.components);
	this.forEach((v, c, w, h) => {
		let hm = h * m;
		let wn = w * n;
		for (let y = 0; y < m; y++) {
		for (let x = 0; x < n; x++) {
			image.set(c, wn + x, hm + y, v);
		}}
	});
	return image;
}
module.exports = multiplyTrivial;