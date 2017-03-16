'use strict';

const gamma = 2.2;
const gamma_1 = 1 / gamma;

function toLinearSpace(value) {
	return ((value / 255) ** gamma) * 255;
}

function makeFromObject(dataObject) {
	// dataObject: {width: N, height: N, data: Array[r, g, b, a, ...]}
	const image = new this.prototype.constructor(dataObject.width, dataObject.height);
	for (let c = 0; c < 4; c++) {
		for (let i = 0; i < image.size; i++) {
			let value = dataObject.data[c + i * 4];
			if (c != 3) {
				value = toLinearSpace(value)
			}
			image.data[c][i] = value;
		}
	}
	return image;
}
module.exports = makeFromObject;