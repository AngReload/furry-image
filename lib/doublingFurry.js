'use strict';

const abs = Math.abs;

function doublingFurry() {
	const FurryImage = this.constructor;

	function coreAxis(prev3, prev2, prev1, center, next1, next2, next3) {
		const a = abs(prev3 - prev2) + abs(prev2 - prev1) + 1;
		const b = abs(prev2 - prev1) + abs(prev1 - center) + 1;
		const c = abs(prev1 - center) + abs(center - next1) + 1;
		const d = abs(center - next1) + abs(next1 - next2) + 1;
		const e = abs(next1 - next2) + abs(next2 - next3) + 1;
		const kEdge = c * c / ((a + c) * (c + e));
		const kSymmetry = (1 - abs(b - d) / (b + d));
		const kSeparated = kEdge * kSymmetry;
		const returnedx = center + kSeparated * (prev1 - next1) / 2;
		const returnedy = center + kSeparated * (next1 - prev1) / 2;
		return clampTwo(returnedx, returnedy, center);
	}

	function clampTwo(x, y, average) {
		const summ = 2 * average;
		if (x < 0) {
			x = 0;
			y = summ - x;
		} else if (x > 255) {
			x = 255;
			y = summ - x;
		} else if (y < 0) {
			y = 0;
			x = summ - y;
		} else if (y > 255) {
			y = 255;
			x = summ - y;
		}

		return [x, y];
	}

	function doubleWidth(image) {
		let width = image.width * 2;
		let height = image.height;
		let returnedimage = new FurryImage(width, height, image.components);
		for (let c = 0; c < image.components.length; c++) {
			for (let h = 0; h < image.height; h++) {
				for (let w = 0; w < image.width; w++) {
					const prev3 = image.get(c, w - 3, h);
					const prev2 = image.get(c, w - 2, h);
					const prev1 = image.get(c, w - 1, h);
					const center = image.get(c, w, h);
					const next1 = image.get(c, w + 1, h);
					const next2 = image.get(c, w + 2, h);
					const next3 = image.get(c, w + 3, h);
					const values = coreAxis(prev3, prev2, prev1, center, next1, next2, next3);
					const w2 = w * 2;
					returnedimage.set(c, w2 + 0, h, values[0]);
					returnedimage.set(c, w2 + 1, h, values[1]);
				}
			}
		}

		return returnedimage;
	}

	function doubleHeight(image) {
		let width = image.width;
		let height = image.height * 2;
		let returnedimage = new FurryImage(width, height, image.components);
		for (let c = 0; c < image.components.length; c++) {
			for (let h = 0; h < image.height; h++) {
				for (let w = 0; w < image.width; w++) {
					const prev3 = image.get(c, w, h - 3);
					const prev2 = image.get(c, w, h - 2);
					const prev1 = image.get(c, w, h - 1);
					const center = image.get(c, w, h);
					const next1 = image.get(c, w, h + 1);
					const next2 = image.get(c, w, h + 2);
					const next3 = image.get(c, w, h + 3);
					const values = coreAxis(prev3, prev2, prev1, center, next1, next2, next3);
					const h2 = h * 2;
					returnedimage.set(c, w, h2 + 0, values[0]);
					returnedimage.set(c, w, h2 + 1, values[1]);
				}
			}
		}

		return returnedimage;
	}

	function merge(image1, image2) {
		let width = image1.width;
		let height = image1.height;
		let size = image1.size;
		let returnedimage = new FurryImage(width, height, image1.components);
		for (let c = 0; c < image1.components.length; c++) {
			for (let i = 0; i < size; i++) {
				returnedimage.data[c][i] = (image1.data[c][i] + image2.data[c][i]) / 2;
			}
		}

		return returnedimage;
	}

	let returnedimage = merge(doubleWidth(doubleHeight(this)), doubleHeight(doubleWidth(this)));

	return returnedimage;
}

module.exports = doublingFurry;
