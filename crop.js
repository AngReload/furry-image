'use strict';
function crop(x, y, width, height) {
	x = x || 0;
	y = y || 0;
	let getter = (v, c, w, h) => this.get(c, w + x, h + y);
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = crop;