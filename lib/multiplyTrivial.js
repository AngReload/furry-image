'use strict';
const Image = require('./Image.js');

module.exports = function multiplyTrivial(image, n = 2, m = n) {
	let xRes = image.xRes * n;
	let yRes = image.yRes * m;

	let canvas = new Image(xRes, yRes, image.zRes, image.ac);

	image.forEach((v, x, y, z) => {
		let xn = x * n;
		let ym = y * m;
		for (let j = 0; j < m; j++) {
		for (let i = 0; i < n; i++) {
			canvas.set(xn + i, ym + j, z, v);
		}}
	});

	return canvas;
}
