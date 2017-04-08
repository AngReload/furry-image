'use strict';
const {ceil, min} = Math;

module.exports = function blockSumming(n = 2, m = n) {
	const xRes = ceil(this.xRes / n);
	const yRes = ceil(this.yRes / m);

	const canvas = new this.constructor(xRes, yRes);

	const getter = (x, y, z) => {
		const xn = x * n;
		const ym = y * m;

		let summ = 0;

		for (let j = 0; j < m; j++) {
		for (let i = 0; i < n; i++) {
			summ += this.get(xn + i, ym + j, z);
		}}

		return min(summ, 1);
	};

	return canvas.fill(getter);
}
