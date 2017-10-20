'use strict';

const Image = require('./Image.js');

module.exports = function (image, i = 0, j = 0, xRes = image.xRes - i, yRes = image.yRes - j) {
	const canvas = new Image(xRes, yRes, image.zRes, image.ac);
	const getter = (x, y, z) => image.get(x + i, y + j, z);
	return canvas.fill(getter);
}
