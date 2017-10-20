'use strict';
const {ceil} = Math;
const Image = require('./Image.js');

module.exports = function blockSubsampling(image, n = 2, m = n) {
	const xRes = ceil(image.xRes / n);
	const yRes = ceil(image.yRes / m);

	const canvas = new Image(xRes, yRes, image.zRes, image.ac);

	const getter = (x, y, z) => {
		const xn = x * n;
		const ym = y * m;

		return image.get(xn, ym, z);
	};

	return canvas.fill(getter);
}
