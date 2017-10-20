'use strict';

module.exports = function blurSquare(image, radius) {	
    const xRes = image.xRes;
    const yRes = image.yRes;
	const zRes = image.zRes;
	const r = Math.floor(radius);
	const k = radius - r;
	const t = radius + 1 + radius;
	const inv_t = 1 / t;
	const temp = image.copy();
	const final = image.copy();
	
	// horizontal
    for (let z = 0; z < zRes; z++) {
        for (let y = 0; y < yRes; y++) {
			let summ = 0;
			for (let xWindow = -r; xWindow <= r; xWindow++) {
				summ += image.get(xWindow - 1, y, z);
			}

			for (let x = 0; x < xRes; x++) {
				const sub = image.get(x - r - 1, y, z);
				const add = image.get(x + r, y, z);
				summ = summ + add - sub;
				const first = sub;
				const last = image.get(x + r + 1, y, z);
				const piece = (first + last) * k;
				const v = (summ + piece) * inv_t;
				temp.set(x, y, z, v);
			}
		}
	}

	// vertical
    for (let z = 0; z < zRes; z++) {
		for (let x = 0; x < xRes; x++) {
			let summ = 0;
			for (let yWindow = -r; yWindow <= r; yWindow++) {
				summ += temp.get(x, yWindow - 1, z);
			}

			for (let y = 0; y < yRes; y++) {
				const sub = temp.get(x, y - r - 1, z);
				const add = temp.get(x, y + r, z);
				summ = summ + add - sub;
				const first = sub;
				const last = temp.get(x, y + r + 1, z);
				const piece = (first + last) * k;
				const v = (summ + piece) * inv_t;
				final.set(x, y, z, v);
			}
		}
	}

	return final;
};
