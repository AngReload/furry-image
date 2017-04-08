'use strict';

const abs = Math.abs;

function doublingFurry(iters = 3) {
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

	let axsisImage = merge(doubleWidth(doubleHeight(this)), doubleHeight(doubleWidth(this)));

	// diagonals
	function fix(doubled, original) {
		const fixed = new FurryImage(doubled.width, doubled.height, doubled.components);
		original.forEach((value, c, w, h) => {
			const t = value * 4;
			const w2 = w * 2;
			const h2 = h * 2;
			let v1 = doubled.get(c, w2 + 0, h2 + 0);
			let v2 = doubled.get(c, w2 + 1, h2 + 0);
			let v3 = doubled.get(c, w2 + 0, h2 + 1);
			let v4 = doubled.get(c, w2 + 1, h2 + 1);
			const s = v1 + v2 + v3 + v4;
			if (s > t) {
				const k = t / s;
				v1 *= k;
				v2 *= k;
				v3 *= k;
				v4 *= k;
			} else if (s < t) {
				const k = (4 * 255 - t) / (4 * 255 - s);
				v1 = 255 - (255 - v1) * k;
				v2 = 255 - (255 - v2) * k;
				v3 = 255 - (255 - v3) * k;
				v4 = 255 - (255 - v4) * k;
			}
			fixed.set(c, w2 + 0, h2 + 0, v1);
			fixed.set(c, w2 + 1, h2 + 0, v2);
			fixed.set(c, w2 + 0, h2 + 1, v3);
			fixed.set(c, w2 + 1, h2 + 1, v4);
		});
		return fixed;
	}

	function blur11p(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w - 1, h - 1);
			const next = img.get(c, w + 1, h + 1);
			return (prev + v + v + next) / 4;
		});
	}

	function blur11m(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w + 1, h - 1);
			const next = img.get(c, w - 1, h + 1);
			return (prev + v + v + next) / 4;
		});
	}

	function blur12p(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w - 2, h - 1);
			const next = img.get(c, w + 2, h + 1);
			return (prev + v + v + next) / 4;
		});
	}

	function blur12m(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w + 2, h - 1);
			const next = img.get(c, w - 2, h + 1);
			return (prev + v + v + next) / 4;
		});
	}

	function blur21p(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w - 1, h - 2);
			const next = img.get(c, w + 1, h + 2);
			return (prev + v + v + next) / 4;
		});
	}

	function blur21m(image) {
		return image.map((v, c, w, h, img) => {
			const prev = img.get(c, w + 1, h - 2);
			const next = img.get(c, w - 1, h + 2);
			return (prev + v + v + next) / 4;
		});
	}

	function blur10p(image) {
		return image.map((v, c, w, h, img) => {
			let errL = 1;
			let errC = 1;
			let errR = 1;

			for (let idx = -5; idx <= 5; idx++) {
				const prev = img.get(c, w + idx, h - 1);
				const next = img.get(c, w + idx, h + 1);

				const valL = img.get(c, w + idx - 1, h);
				const valC = img.get(c, w + idx,     h);
				const valR = img.get(c, w + idx + 1, h);

				errL += abs(prev - valL) + abs(next - valL);
				errC += abs(prev - valC) + abs(next - valC);
				errR += abs(prev - valR) + abs(next - valR);
			}

			if (errL < errR) {
				const kDiff = errC / (errL + errC);
				return (1 - kDiff) * v + kDiff * img.get(c, w - 1, h);
			} else if (errL > errR) {
				const kDiff = errC / (errR + errC);
				return (1 - kDiff) * v + kDiff * img.get(c, w + 1, h);
			}

			return v;
		});
	}

	function blur01p(image) {
		return image.map((v5, c, w, h, img) => {
			// v1 v4 v7
			// v2 v5 v8
			// v3 v6 v9
			const v1 = img.get(c, w - 1, h - 1);
			const v2 = img.get(c, w - 1, h + 0);
			const v3 = img.get(c, w - 1, h + 1);

			const v4 = img.get(c, w + 0, h - 1);
			const v6 = img.get(c, w + 0, h + 1);

			const v7 = img.get(c, w + 1, h - 1);
			const v8 = img.get(c, w + 1, h + 0);
			const v9 = img.get(c, w + 1, h + 1);

			// mse for shift to Left
			const mseL = 1 +
				(v1 - v5) ** 2 +
				(v2 - v6) ** 2 +
				(v5 - v7) ** 2 +
				(v6 - v8) ** 2 +
				(v3 - v6) ** 2 +
				(v6 - v9) ** 2;

			// mse for shift to Right
			const mseR = 1 +
				(v1 - v4) ** 2 +
				(v4 - v7) ** 2 +
				(v2 - v4) ** 2 +
				(v3 - v5) ** 2 +
				(v4 - v8) ** 2 +
				(v5 - v9) ** 2;

			const kEfficiency = abs(mseL - mseR) / (mseL + mseR);
			const isToLeft = mseL < mseR;
			return (1 - kEfficiency) * v5 + kEfficiency * (isToLeft ? v6 : v4);
		});
	}

	// init
	let image11p = fix(blur11p(axsisImage), this);
	let image11m = fix(blur11m(axsisImage), this);
	// let image12p = fix(blur12p(axsisImage), this);
	// let image12m = fix(blur12m(axsisImage), this);
	// let image21p = fix(blur21p(axsisImage), this);
	// let image21m = fix(blur21m(axsisImage), this);
	let image10p = blur10p(axsisImage);
	// let image01p = fix(blur01p(axsisImage), this);

	while (iters--) {
		image11p = fix(blur11p(image11p), this);
		image11m = fix(blur11m(image11m), this);
		// image12p = fix(blur12p(image12p), this);
		// image12m = fix(blur12m(image12m), this);
		// image21p = fix(blur21p(image21p), this);
		// image21m = fix(blur21m(image21m), this);
		image10p = blur10p(axsisImage);
		// image01p = fix(blur01p(axsisImage), this);
	}

	function compose(original, axsisImage, mainImage, minorImage) {
		const finalImage = new FurryImage(axsisImage.width, axsisImage.height, axsisImage.components);
		original.forEach((value, c, w, h, img) => {
			// area
			const matrix = [];
			for (let y = -2; y <= 2; y++) {
				matrix[y + 2] = [];
				for (let x = -2; x <= 2; x++) {
					matrix[y + 2][x + 2] = img.get(c, w + x, h + y);
				}
			}
			let antiMain = 1;
			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 4; x++) {
					antiMain += abs(matrix[y][x] - matrix[y + 1][x + 1]);
				}
			}
			let antiMinor = 1;
			for (let y = 0; y < 4; y++) {
				for (let x = 1; x < 5; x++) {
					antiMinor += abs(matrix[y][x] - matrix[y + 1][x - 1]);
				}
			}
			antiMain  **= 5;
			antiMinor **= 5;

			const isMain = antiMain < antiMinor;
			const kDiagonal = abs(antiMain - antiMinor) / (antiMain + antiMinor);

			const w2 = w * 2;
			const h2 = h * 2;
			let v1 = (1 - kDiagonal) * axsisImage.get(c, w2 + 0, h2 + 0);
			let v2 = (1 - kDiagonal) * axsisImage.get(c, w2 + 1, h2 + 0);
			let v3 = (1 - kDiagonal) * axsisImage.get(c, w2 + 0, h2 + 1);
			let v4 = (1 - kDiagonal) * axsisImage.get(c, w2 + 1, h2 + 1);

			if (isMain) {
				v1 += kDiagonal * mainImage.get(c, w2 + 0, h2 + 0);
				v2 += kDiagonal * mainImage.get(c, w2 + 1, h2 + 0);
				v3 += kDiagonal * mainImage.get(c, w2 + 0, h2 + 1);
				v4 += kDiagonal * mainImage.get(c, w2 + 1, h2 + 1);
			} else {
				v1 += kDiagonal * minorImage.get(c, w2 + 0, h2 + 0);
				v2 += kDiagonal * minorImage.get(c, w2 + 1, h2 + 0);
				v3 += kDiagonal * minorImage.get(c, w2 + 0, h2 + 1);
				v4 += kDiagonal * minorImage.get(c, w2 + 1, h2 + 1);
			}
			finalImage.set(c, w2 + 0, h2 + 0, v1);
			finalImage.set(c, w2 + 1, h2 + 0, v2);
			finalImage.set(c, w2 + 0, h2 + 1, v3);
			finalImage.set(c, w2 + 1, h2 + 1, v4);
		});
		return finalImage;
	}

	return image10p //compose(this, axsisImage, image11p, image11m);
}

module.exports = doublingFurry;
