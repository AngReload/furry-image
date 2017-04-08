'use strict';
const {ceil} = Math;

module.exports = function blockSubsampling(n = 2, m = n) {
	const xRes = ceil(this.xRes / n);
	const yRes = ceil(this.yRes / m);

	const canvas = new this.constructor(xRes, yRes);

	const getter = (x, y, z) => {
		const xn = x * n;
		const ym = y * m;

		return this.get(xn, ym, z);
	};

	return canvas.fill(getter);
}
