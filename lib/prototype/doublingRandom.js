'use strict';

const {min, max, random} = Math;

function makeRndByAverage(average) {
	const summ = average * 2;
	const aMIN = max(summ - 255, 0);	// minimal A == SUMM - MAX_B, but A >= 0
	const aMAX = min(255, summ);		// maximal A == 255, but A <= SUMM
	const a = (aMAX - aMIN) * random() + aMIN;
	const b = summ - a;
	return [a, b];
}

module.exports = function doublingRandom() {
	const xRes = this.xRes * 2;
	const yRes = this.yRes * 2;

	const image_2 = new this.constructor(this.xRes, yRes, this.components);

	this.forEach((v, x, y, z) => {
		const [a, b] = makeRndByAverage(v);
		const y2 = y * 2;
		image_2.set(x, y2 + 0, z, a);
		image_2.set(x, y2 + 1, z, b);
	});

	const image_4 = new this.constructor(xRes, yRes, this.components);

	image_2.forEach((v, x, y, z) => {
		const [a, b] = makeRndByAverage(v);
		const x2 = x * 2;
		image_4.set(x2 + 0, y, z, a);
		image_4.set(x2 + 1, y, z, b);
	});

	return image_4;
}
