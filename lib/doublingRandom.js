'use strict';

const {min, max, random} = Math;
const Image = require('./Image.js');

function makeRndByAverage(average, limit = 1) {
	const summ = average * 2;
	const aMIN = max(summ - limit, 0);	// minimal A == SUMM - MAX_B, but A >= 0
	const aMAX = min(limit, summ);		// maximal A == 255, but A <= SUMM
	const a = (aMAX - aMIN) * random() + aMIN;
	const b = summ - a;
	return [a, b];
}

module.exports = function doublingRandom(iLRGBA, limit = 1) {
	const xRes = iLRGBA.xRes * 2;
	const yRes = iLRGBA.yRes * 2;

	const canvas = new Image(xRes, yRes, iLRGBA.zRes, iLRGBA.ac);

	iLRGBA.forEach((v, x, y, z) => {
        const [f, s] = makeRndByAverage(v, limit);
        const [a, b] = makeRndByAverage(f, limit);
        const [c, d] = makeRndByAverage(s, limit);
		const x2 = x * 2;        
		const y2 = y * 2;
		canvas.set(x2 + 0, y2 + 0, z, a);
		canvas.set(x2 + 1, y2 + 0, z, b);
		canvas.set(x2 + 0, y2 + 1, z, c);
		canvas.set(x2 + 1, y2 + 1, z, d);
	});

	return canvas;
}
