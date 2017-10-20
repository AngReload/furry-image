'use strict';

module.exports = function ycocg(n) {
	const {toGamma, toLinear} = this.constructor.color;

	return this.mapColor(([r, g, b]) => {
		const R = toGamma(r) * 255;
		const G = toGamma(g) * 255;
		const B = toGamma(b) * 255;

		const Y   =  R/4 + G/2 + B/4;
		const Cg  = -R/4 + G/2 - B/4;
		const Co  =  R/2 - B/2;

		const component1 = toLinear(Y / 255);
		const component2 = toLinear((Co + 127.5) / 255);
		const component3 = toLinear((Cg + 127.5) / 255);

		if (n === 1) {
			return [component1, component1, component1, 1];
		} else if (n === 2) {
			return [component2, component2, component2, 1];
		} else if (n === 3) {
			return [component3, component3, component3, 1];
		} else {
			return [component1, component2, component3, 1];
		}

	});
}
