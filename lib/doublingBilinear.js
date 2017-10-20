'use strict';
const Image = require('./Image.js');
function doublingBilinear(input) {
	const xRes = input.xRes * 2;
	const yRes = input.yRes * 2;
	const zRes = input.zRes;
	const image = new Image(xRes, yRes, zRes, input.ac);
	input.forEach((v, w, h, c) => {
		// 0 1 2
		// 3 4 5
		// 6 7 8
		const area = [
			input.get(w - 1, h - 1, c),
			input.get(w + 0, h - 1, c),
			input.get(w + 1, h - 1, c),
			input.get(w - 1, h + 0, c),
			v,
			input.get(w + 1, h + 0, c),
			input.get(w - 1, h + 1, c),
			input.get(w + 0, h + 1, c),
			input.get(w + 1, h + 1, c)
		];
		const value_a = 0.5625 * area[4] + 0.1875 * area[1] + 0.1875 * area[3] + 0.0625 * area[0];
		const value_b = 0.5625 * area[4] + 0.1875 * area[1] + 0.1875 * area[5] + 0.0625 * area[2];
		const value_c = 0.5625 * area[4] + 0.1875 * area[3] + 0.1875 * area[7] + 0.0625 * area[6];
		const value_d = 0.5625 * area[4] + 0.1875 * area[5] + 0.1875 * area[7] + 0.0625 * area[8];
		// set values
		const w2 = w * 2;
		const h2 = h * 2;
		image.set(w2 + 0, h2 + 0, c, value_a);
		image.set(w2 + 1, h2 + 0, c, value_b);
		image.set(w2 + 0, h2 + 1, c, value_c);
		image.set(w2 + 1, h2 + 1, c, value_d);
	});

	return image;
}
module.exports = doublingBilinear;