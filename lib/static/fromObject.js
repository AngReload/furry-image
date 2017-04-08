'use strict';

const {toLinear} = require('./../utils');

module.exports = function fromObject(dataObject) {
	const xRes = dataObject.width;
	const yRes = dataObject.height;

	const image = new this.prototype.constructor(xRes, yRes)
		.map((v, x, y, z, img) => {
			let idx = (x + y * xRes) * 4 + z;
			let value = dataObject.data[idx] / 255;

			// для слоёв кроме alpha перевод из гамма в линейные величины
			if (z < 3) {
				value = toLinear(value);
			}

			return value;
		});

	return image;
}
