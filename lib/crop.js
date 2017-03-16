'use strict';
function crop(x = 0, y = 0, width = 1, height = 1) {
	const getter = (v, c, w, h) => this.get(c, w + x, h + y);
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = crop;