'use strict';
const ceil = Math.ceil;

function blockSubsampling(n = 2, m = n) {
	const width = ceil(this.width / n);
	const height = ceil(this.height / m);
	const getter = (v, c, w, h) => this.get(c, w * n, h * m);
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = blockSubsampling;