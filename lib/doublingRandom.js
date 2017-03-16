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

function doublingRandom() {
	const width = this.width * 2;
	const height = this.height * 2;
	const image_2 = new this.constructor(this.width, height, this.components);
	this.forEach((v, c, w, h) => {
		const [a, b] = makeRndByAverage(v);
		const h2 = h * 2;
		image_2.set(c, w, h2 + 0, a);
		image_2.set(c, w, h2 + 1, b);
	});
	const image_4 = new this.constructor(width, height, this.components);
	image_2.forEach((v, c, w, h) => {
		const [a, b] = makeRndByAverage(v);
		const w2 = w * 2;
		image_4.set(c, w2 + 0, h, a);
		image_4.set(c, w2 + 1, h, b);
	});
	return image_4;
}

module.exports = doublingRandom;