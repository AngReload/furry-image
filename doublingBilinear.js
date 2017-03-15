'use strict';
function doublingBilinear() {
	let width = this.width * 2;
	let height = this.height * 2;
	let components = this.components;
	let returned_image = new this.constructor(width, height, components);
	for (let c = 0; c < components.length; c++) {
		for (let h = 0; h < this.height; h++) {
		for (let w = 0; w < this.width; w++) {
			// 0 1 2
			// 3 4 5
			// 6 7 8
			let area = [
				this.get(c, w - 1, h - 1),
				this.get(c, w + 0, h - 1),
				this.get(c, w + 1, h - 1),
				this.get(c, w - 1, h + 0),
				this.get(c, w + 0, h + 0),
				this.get(c, w + 1, h + 0),
				this.get(c, w - 1, h + 1),
				this.get(c, w + 0, h + 1),
				this.get(c, w + 1, h + 1)
			];
			let value_a = 0.5625 * area[4] + 0.1875 * area[1] + 0.1875 * area[3] + 0.0625 * area[0];
			let value_b = 0.5625 * area[4] + 0.1875 * area[1] + 0.1875 * area[5] + 0.0625 * area[2];
			let value_c = 0.5625 * area[4] + 0.1875 * area[3] + 0.1875 * area[7] + 0.0625 * area[6];
			let value_d = 0.5625 * area[4] + 0.1875 * area[5] + 0.1875 * area[7] + 0.0625 * area[8];
			// set values
			let w2 = w * 2;
			let h2 = h * 2;
			returned_image.set(c, w2 + 0, h2 + 0, value_a);
			returned_image.set(c, w2 + 1, h2 + 0, value_b);
			returned_image.set(c, w2 + 0, h2 + 1, value_c);
			returned_image.set(c, w2 + 1, h2 + 1, value_d);
		}}
	}
	return returned_image;
}
module.exports = doublingBilinear;