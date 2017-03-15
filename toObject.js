'use strict';

const gamma = 2.2;
const gamma_1 = 1 / gamma;

function toObject() {
	if (   this.components[0] != 'r'
		|| this.components[1] != 'g'
		|| this.components[2] != 'b'
		|| this.components[3] != 'a'
	) {
		throw new Error ('Is not RGBA');
	}
	// dataObject: {width: N, height: N, data: Array[r, g, b, a, ...]}
	let dataObject = {
		width: this.width,
		height: this.height,
		data: new Uint8ClampedArray(this.size * 4)
	}
	function toGammaSpace(value) {
		return ((value / 255) ** gamma_1) * 255;
	}
	for (let c = 0; c < 4; c++) {
		for (var i = 0; i < this.size; i++) {
			let value = this.data[c][i];
			if (c != 3) {
				value = toGammaSpace(value)
			}
			dataObject.data[c + i * 4] = value;
		}
	}
	return dataObject;
}
module.exports = toObject;