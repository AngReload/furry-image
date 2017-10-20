'use strict';
const {ceil, min} = Math;
const Image = require('./Image.js');

module.exports = function (iLRGBA, n = 2, m = n) {

	const xRes = ceil(iLRGBA.xRes / n);
	const yRes = ceil(iLRGBA.yRes / m);

	const canvas = new Image(xRes, yRes, iLRGBA.zRes, iLRGBA.ac);

	const getter = (x, y, z) => {
		const xn = x * n;
		const ym = y * m;

		let summ = 0;

		for (let j = 0; j < m; j++) {
		for (let i = 0; i < n; i++) {
			summ += iLRGBA.get(xn + i, ym + j, z);
		}}

		return summ;
	};

	return canvas.fill(getter);
}
