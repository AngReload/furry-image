'use strict';

module.exports = function ameIndex(image1, image2) {
	const {min, abs} = Math;
	const {toLinear, toGamma} = this.color;

	const xRes = image1.xRes;
	const yRes = image1.yRes;

	if (xRes !== image2.xRes || yRes !== image2.yRes) {
		throw 'xRes == xRes && yRes == yRes';
	}

	let absErr = 0;

	for (let y = 0; y < yRes; y++) {
		for (let x = 0; x < xRes; x++) {
			for (let z = 0; z < 3; z++) {
				const v1 = image1.get(x, y, z);
				const v2 = image2.get(x, y, z);

				const V1 = toGamma(v1) * 255;
				const V2 = toGamma(v2) * 255;
				
				absErr += abs(V1 - V2);
			}
		}
	}

	return absErr / (xRes * yRes * 3);
}
