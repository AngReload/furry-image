'use strict';
const ceil = Math.ceil;

function blockSubsampling(n, m) {
	n = n || 2;
	m = m || n;
	let width = ceil(this.width / n);
	let height = ceil(this.height / m);
	let getter = (v, c, w, h) => this.get(c, w * n, h * m);
	return new this.constructor(width, height, this.components).map(getter);
}
module.exports = blockSubsampling;