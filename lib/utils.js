'use strict';

const {round} = Math;

module.exports = {
	toLinear(v) {
		return v > 0.04045 ? (((v + 0.055) / 1.055) ** 2.4) : (v / 12.92);
	},
	toGamma(v) {
		return v > 0.0031308 ? (v ** (1.0 / 2.4) * 1.055 - 0.055) : v * 12.92;	
	},
	toLuma(r, g, b) {
		return (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	},
	clampTo8bit(v) {
		if (v < 0) {
			return 0;
		} else if (v > 255) {
			return 255;
		}
		
		return round(v);
	},
}
