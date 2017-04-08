'use strict';

module.exports = function multiplyTrivial(n = 2, m = n) {
	let xRes = this.xRes * n;
	let yRes = this.yRes * m;

	let image = new this.constructor(xRes, yRes, this.zRes);

	this.forEach((v, x, y, z) => {
		let xn = x * n;
		let ym = y * m;
		for (let j = 0; j < m; j++) {
		for (let i = 0; i < n; i++) {
			image.set(xn + i, ym + j, z, v);
		}}
	});

	return image;
}
