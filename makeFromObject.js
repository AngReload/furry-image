'use strict';

const gamma = 2.2;
const gamma_1 = 1 / gamma;

function makeFromObject(dataObject) {
	// dataObject: {width: N, height: N, data: Array[r, g, b, a, ...]}
	let returned_image = new this.prototype.constructor(dataObject.width, dataObject.height);
	function toLinearSpace(value) {
		return ((value / 255) ** gamma) * 255;
	}
	for (let c = 0; c < 4; c++) {
		for (let i = 0; i < returned_image.size; i++) {
			let value = dataObject.data[c + i * 4];
			if (c != 3) {
				value = toLinearSpace(value)
			}
			returned_image.data[c][i] = value;
		}
	}
	return returned_image;
}
module.exports = makeFromObject;