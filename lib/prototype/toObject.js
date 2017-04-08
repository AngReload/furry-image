'use strict';

const {round} = Math;

const {toGamma, toLinear} = require('./../utils');

module.exports = function toObject() {
	const xRes = this.xRes;
	const yRes = this.yRes;
	
	const dataObject = {
		width:  xRes,
		height: yRes,
		data:   new Uint8ClampedArray(xRes * yRes * 4),
	}

	this.copy()
		.forEach((v, x, y, z, img) => {
			// round off the value and calculate the rounding error.
			let vUnit8;
			let vError;
			if (z < 3) {
				vUnit8 = makeValueUnit8Gamma(v);
				vError = makeErrorWithGamma(v, vUnit8);
			} else {
				vUnit8 = makeValueUnit8(v);
				vError = makeError(v, vUnit8);
			}

			// set value
			const idx = (y * xRes + x) * 4 + z;
			dataObject.data[idx] = vUnit8;

			// sierra lite error diff with gamma correction
			const vError2 = vError / 2;
			const vError4 = vError / 4;

			const vR = img.get(x + 1, y    , z);
			const vL = img.get(x - 1, y + 1, z);
			const vB = img.get(x    , y + 1, z);

			img.set(x + 1, y    , z, vR + vError2);
			img.set(x - 1, y + 1, z, vL + vError4);
			img.set(x    , y + 1, z, vB + vError4);
		});

	return dataObject;
}

// for linear space
function makeValueUnit8(v) {
	if (v <= 0) return 0;
	if (v >= 1) return 255;

	const vUnit8 = round(v * 255);
	return vUnit8;
}

function makeError(v, vUnit8) {
	return v - (vUnit8 / 255);
}

// for gamma space
function makeValueUnit8Gamma(v) {
	if (v <= 0) return 0;
	if (v >= 1) return 255;

	const vGamma = toGamma(v);
	const vUnit8 = round(vGamma * 255);
	return vUnit8;
}

function makeErrorWithGamma(v, vUnit8) {
	const vLinear = toLinear(vUnit8 / 255);
	return v - vLinear;
}
