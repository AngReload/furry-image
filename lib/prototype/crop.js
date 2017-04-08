'use strict';

module.exports = function crop(i = 0, j = 0, xRes = this.xRes - i, yRes = this.yRes - j) {
	const canvas = new this.constructor(xRes, yRes);
	const getter = (x, y, z) => this.get(x + i, y + j, z);
	return canvas.fill(getter);
}
