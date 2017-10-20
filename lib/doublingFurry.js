'use strict';

const Image = require('./Image.js');

module.exports = function doublingFurry(input) {
	let iters = 4;
	const abs = Math.abs;
	const eps = 1 / 256;

	function coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3) {
		const a = abs(prev_3 - prev_2) + abs(prev_2 - prev_1) + eps;
		const b = abs(prev_2 - prev_1) + abs(prev_1 - center) + eps;
		const c = abs(prev_1 - center) + abs(center - next_1) + eps;
		const d = abs(center - next_1) + abs(next_1 - next_2) + eps;
		const e = abs(next_1 - next_2) + abs(next_2 - next_3) + eps;

		const kEdge = c * c / ((a + c) * (c + e));

		const kSymmetry = (1 - abs(b - d) / (b + d));

		const kSeparated = kEdge * kSymmetry;

		const returnedA = center + kSeparated * (prev_1 - next_1) / 2;
		const returnedB = center + kSeparated * (next_1 - prev_1) / 2;

		return clampTwo(returnedA, returnedB, center);
	}

	function clampTwo(a, b, average) {
		const sum = 2 * average;
		if (a < 0) {
			a = 0;
			b = sum - a;
		} else if (a > 1) {
			a = 1;
			b = sum - a;
		} else if (b < 0) {
			b = 0;
			a = sum - b;
		} else if (b > 1) {
			b = 1;
			a = sum - b;
		}

		return [a, b];
	}

	function doubleX(input) {
		const xRes = input.xRes * 2;
		const yRes = input.yRes;
		const zRes = input.zRes;
		const ac = input.ac;

		const output = new Image(xRes, yRes, zRes, ac);

		input.forEach((v, x, y, z, img) => {
			const [v0, v1] = coreAxis(
				img.get(x - 3, y, z),
				img.get(x - 2, y, z),
				img.get(x - 1, y, z),
				v,
				img.get(x + 1, y, z),
				img.get(x + 2, y, z),
				img.get(x + 3, y, z)
			);

			const x2 = x * 2;
			output.set(x2 + 0, y, z, v0);
			output.set(x2 + 1, y, z, v1);
		});

		return output;
	}

	function doubleY(input) {
		const xRes = input.xRes;
		const yRes = input.yRes * 2;
		const zRes = input.zRes;
		const ac = input.ac;

		const output = new Image(xRes, yRes, zRes, ac);

		input.forEach((v, x, y, z, img) => {
			const [v0, v1] = coreAxis(
				img.get(x, y - 3, z),
				img.get(x, y - 2, z),
				img.get(x, y - 1, z),
				v,
				img.get(x, y + 1, z),
				img.get(x, y + 2, z),
				img.get(x, y + 3, z)
			);

			const y2 = y * 2;
			output.set(x, y2 + 0, z, v0);
			output.set(x, y2 + 1, z, v1);
		});

		return output;
	}

	function merge(imageA, imageB) {
		const xRes = imageA.xRes;
		const yRes = imageA.yRes;
		const zRes = input.zRes;
		const ac = input.ac;

		const output = new Image(xRes, yRes, zRes, ac).fill((x, y, z) => {
			const vA = imageA.get(x, y, z);
			const vB = imageB.get(x, y, z);
			return (vA + vB) / 2;
		});

		return output;
	}

	const axsisImage = merge(
		doubleX(doubleY(input)),
		doubleY(doubleX(input))
	);

	/*
	console.time('doubling');
	let returned_image = axsisImage.copy();
	for (let i = 0; i < iters; i++) {
		returned_image = fxsr(returned_image, input, true);
	}
	console.timeEnd('doubling');
	return returned_image;
	*/

	function restore(original, doubled) {
		const fixed = new Image(doubled.xRes, doubled.yRes, doubled.zRes, doubled.ac);
		original.forEach((v, x, y, z) => {
			const t = v * 4;
			const x2 = x * 2;
			const y2 = y * 2;
			let v1 = doubled.get(x2 + 0, y2 + 0, z);
			let v2 = doubled.get(x2 + 1, y2 + 0, z);
			let v3 = doubled.get(x2 + 0, y2 + 1, z);
			let v4 = doubled.get(x2 + 1, y2 + 1, z);
			const s = v1 + v2 + v3 + v4;
			if (s > t) {
				const k = t / s;
				v1 *= k;
				v2 *= k;
				v3 *= k;
				v4 *= k;
			} else if (s < t) {
				const k = (4 - t) / (4 - s);
				v1 = 1 - (1 - v1) * k;
				v2 = 1 - (1 - v2) * k;
				v3 = 1 - (1 - v3) * k;
				v4 = 1 - (1 - v4) * k;
			}
			fixed.set(x2 + 0, y2 + 0, z, v1);
			fixed.set(x2 + 1, y2 + 0, z, v2);
			fixed.set(x2 + 0, y2 + 1, z, v3);
			fixed.set(x2 + 1, y2 + 1, z, v4);
		});
		return fixed;
	}

	function blur11p(image) {
		return image.map((v, x, y, z, img) => {
			const prev = img.get(x - 1, y - 1, z);
			const next = img.get(x + 1, y + 1, z);
			return (prev + v + v + next) / 4;
		});
	}
	
	function blur11m(image) {
		return image.map((v, x, y, z, img) => {
			const prev = img.get(x + 1, y - 1, z);
			const next = img.get(x - 1, y + 1, z);
			return (prev + v + v + next) / 4;
		});
	}

	let image11p = axsisImage.copy();
	let image11m = axsisImage.copy();
	// let image12p = fix(blur12p(axsisImage), this);
	// let image12m = fix(blur12m(axsisImage), this);
	// let image21p = fix(blur21p(axsisImage), this);
	// let image21m = fix(blur21m(axsisImage), this);
	// let image10p = blur10p(axsisImage);
	// let image01p = fix(blur01p(axsisImage), this);
	 
	while (iters--) {
		image11p = restore(input, blur11p(image11p));
		image11m = restore(input, blur11m(image11m));
		// image12p = fix(blur12p(image12p), this);
		// image12m = fix(blur12m(image12m), this);
		// image21p = fix(blur21p(image21p), this);
		// image21m = fix(blur21m(image21m), this);
		// image10p = blur10p(axsisImage);
		// image01p = fix(blur01p(axsisImage), this);
	}


	function compose(original, axsisImage, mainImage, minorImage) {
			const finalImage = new Image(axsisImage.xRes, axsisImage.yRes, axsisImage.zRes, axsisImage.ac);
			original.forEach((value, w, h, c, img) => {
				// area
				const matrix = [];
				for (let y = -2; y <= 2; y++) {
					matrix[y + 2] = [];
					for (let x = -2; x <= 2; x++) {
						matrix[y + 2][x + 2] = img.get(w + x, h + y, c);
					}
				}
				let antiMain = eps;
				for (let y = 0; y < 4; y++) {
					for (let x = 0; x < 4; x++) {
						antiMain += abs(matrix[y][x] - matrix[y + 1][x + 1]);
					}
				}
				let antiMinor = eps;
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

				let v1 = (1 - kDiagonal) * axsisImage.get(w2 + 0, h2 + 0, c);
				let v2 = (1 - kDiagonal) * axsisImage.get(w2 + 1, h2 + 0, c);
				let v3 = (1 - kDiagonal) * axsisImage.get(w2 + 0, h2 + 1, c);
				let v4 = (1 - kDiagonal) * axsisImage.get(w2 + 1, h2 + 1, c);

				if (isMain) {
					v1 += kDiagonal * mainImage.get(w2 + 0, h2 + 0, c);
					v2 += kDiagonal * mainImage.get(w2 + 1, h2 + 0, c);
					v3 += kDiagonal * mainImage.get(w2 + 0, h2 + 1, c);
					v4 += kDiagonal * mainImage.get(w2 + 1, h2 + 1, c);
				} else {
					v1 += kDiagonal * minorImage.get(w2 + 0, h2 + 0, c);
					v2 += kDiagonal * minorImage.get(w2 + 1, h2 + 0, c);
					v3 += kDiagonal * minorImage.get(w2 + 0, h2 + 1, c);
					v4 += kDiagonal * minorImage.get(w2 + 1, h2 + 1, c);
				}
				finalImage.set(w2 + 0, h2 + 0, c, v1);
				finalImage.set(w2 + 1, h2 + 0, c, v2);
				finalImage.set(w2 + 0, h2 + 1, c, v3);
				finalImage.set(w2 + 1, h2 + 1, c, v4);
			});
			return finalImage;
		}

	// return axsisImage;
	// return restore(input, axsisImage);
	// return image11m;
	return compose(input, axsisImage, image11p, image11m);
};

function fxsr(doubled_image, original_image, and_fix) {
	const abs = Math.abs;
	const max = Math.max;
	const min = Math.min;
	const eps = 1 / 256;

	function iter(image, x, y, c, doubled_image) {
		const g = (w, h) => image.get(x + w, y + h, c);
		//	    0     1
		//	 2  3  4  5  6
		//	    7  8  9
		//	10 11 12 13 14
		//	   15    16
		let v = [
					   g(-1, -2),           g(1, -2),
			g(-2, -1), g(-1, -1), g(0, -1), g(1, -1), g(2, -1),
					   g(-1,  0), g(0,  0), g(1,  0),
			g(-2,  1), g(-1,  1), g(0,  1), g(1,  1), g(2,  1),
					   g(-1,  2),           g(1,  2)
		];
		const ad = (i, j) => abs(v[i] - v[j]);
		// anti-dimension axis-x (0:1) test
		let ad_01 = ad(7, 8) + ad(8, 9) +
			0.5 * (
				ad(3, 4) + ad(4, 5) +
				ad(11, 12) + ad(12, 13)
			) + eps;
		// anti-dimension axis-y (1:0) test
		let ad_10 = ad(4, 8) + ad(8, 12) +
			0.5 * (
				ad(3, 7) + ad(7, 11) +
				ad(5, 9) + ad(9, 13)
			) + eps;
		// anti-dimension diagonal-main (1:1) test
		let ad_11 = ad(3, 8) + ad(8, 13) + ad(4, 9) + ad(7, 12) + eps;
		// anti-dimension diagonal-minor (1:-1) test
		let ad_11m = ad(5, 8) + ad(8, 11) + ad(4, 7) + ad(9, 12) + eps;
		// anti-dimension inclined 2 - 1
		let ad_12 = ad(2, 8) + ad(8, 14) + ad(3, 9) + ad(7, 13) + eps;
		let ad_21 = ad(0, 8) + ad(8, 16) + ad(4, 13) + ad(3, 12) + eps;
		let ad_12m = ad(6, 8) + ad(8, 10) + ad(5, 7) + ad(9, 11) + eps;
		let ad_21m = ad(1, 8) + ad(8, 15) + ad(4, 11) + ad(5, 12) + eps;
		// get minimal
		let m = min(ad_01, ad_10, ad_11, ad_11m, ad_12, ad_21, ad_12m, ad_21m);
		let k_none = 0,
			kd_01  = 0,
			kd_10  = 0,
			kd_11  = 0,
			kd_11m = 0,
			kd_12  = 0,
			kd_21  = 0,
			kd_12m = 0,
			kd_21m = 0;
		const cubic = (A, B, C, D) => -0.0625 * A + 0.5625 * B + 0.5625 * C - 0.0625 * D;

		if (ad_01 === m) {
			let ad_12m$01 = cubic(ad_11m, ad_12m, ad_01, ad_12);
			let ad_01$12 =          cubic(ad_12m, ad_01, ad_12, ad_11);
			let m2 = min(ad_12m$01, ad_01, ad_01$12);
			if (m2 === ad_01) {
				k_none = ad_01 / ad_10;
				kd_01 = 1 - k_none;
			} else if (ad_12m$01 === m2) {
				let ad_21$10 = cubic(ad_11, ad_21, ad_10, ad_21m);
				k_none = max(1, ad_12m$01) / max(1, ad_21$10);
				kd_01  = (1 - k_none) * 0.5;
				kd_12m = (1 - k_none) * 0.5;
			} else {
				let ad_10$21m = cubic(ad_21, ad_10, ad_21m, ad_11m);
				k_none = max(1, ad_01$12) / max(1, ad_10$21m);
				kd_01 = (1 - k_none) * 0.5;
				kd_12 = (1 - k_none) * 0.5;
			}
		} else if (ad_10 === m) {
			let ad_21$10 = cubic(ad_11, ad_21, ad_10, ad_21m);
			let ad_10$21m =       cubic(ad_21, ad_10, ad_21m, ad_11m);
			let m2 = min(ad_21$10, ad_10, ad_10$21m);
			if (m2 === ad_10) {
				k_none = ad_10 / ad_01;
				kd_10 = 1 - k_none;
			} else if (m2 === ad_21$10) {
				let ad_12m$01 = cubic(ad_11m, ad_12m, ad_01, ad_12);
				k_none = max(1, ad_21$10) / max(1, ad_12m$01);
				kd_10 = (1 - k_none) * 0.5;
				kd_21 = (1 - k_none) * 0.5;
			} else {
				let ad_01$12 = cubic(ad_12m, ad_01, ad_12, ad_11);
				k_none = max(1, ad_10$21m) / max(1, ad_01$12);
				kd_10 = (1 - k_none) * 0.5;
				kd_21m = (1 - k_none) * 0.5;
			}
		} else if (ad_11 === m) {
			let ad_12$11 = cubic(ad_01, ad_12, ad_11, ad_21);
			let ad_11$21 =        cubic(ad_12, ad_11, ad_21, ad_10);
			let m2 = min(ad_12$11, ad_11, ad_11$21);
			if (m2 === ad_11) {
				k_none = ad_11 / ad_11m;
				kd_11 = 1 - k_none;
			} else if (ad_12$11 === m2) {
				let ad_21m$11m = cubic(ad_10, ad_21m, ad_11m, ad_12m);
				k_none = max(1, ad_12$11) / max(1, ad_21m$11m);
				kd_11 = (1 - k_none) * 0.5;
				kd_12 = (1 - k_none) * 0.5;
			} else {
				let ad_11m$12m = cubic(ad_21m, ad_11m, ad_12m, ad_01);
				k_none = max(1, ad_11$21) / max(1, ad_11m$12m);
				kd_11 = (1 - k_none) * 0.5;
				kd_21 = (1 - k_none) * 0.5;
			}
		} else if (ad_11m === m) {
			let ad_21m$11m = cubic(ad_10, ad_21m, ad_11m, ad_12m);
			let ad_11m$12m =        cubic(ad_21m, ad_11m, ad_12m, ad_01);
			let m2 = min(ad_21m$11m, ad_11m, ad_11m$12m);
			if (m2 === ad_11m) {
				k_none = ad_11m / ad_11;
				kd_11m = 1 - k_none;
			} else if (ad_21m$11m === m2) {
				let ad_12$11 = cubic(ad_01, ad_12, ad_11, ad_21);
				k_none = max(1, ad_21m$11m) / max(1, ad_12$11);
				kd_11m = (1 - k_none) * 0.5;
				kd_21m = (1 - k_none) * 0.5;
			} else {
				let ad_11$21 = cubic(ad_12, ad_11, ad_21, ad_10);
				k_none = max(1, ad_11m$12m) / max(1, ad_11$21);
				kd_11m = (1 - k_none) * 0.5;
				kd_12m = (1 - k_none) * 0.5;
			}
		} else if (ad_12 === m) {
			let ad_01$12 = cubic(ad_12m, ad_01, ad_12, ad_11);
			let ad_12$11 =         cubic(ad_01, ad_12, ad_11, ad_21);
			let m2 = min(ad_01$12, ad_12, ad_12$11);
			if (m2 === ad_12) {
				k_none = ad_12 / ad_21m;
				kd_12 = 1 - k_none;
			} else if (m2 === ad_01$12) {
				let ad_10$21m = cubic(ad_21, ad_10, ad_21m, ad_11m);
				k_none = max(1, ad_01$12) / max(1, ad_10$21m);
				kd_01 = (1 - k_none) * 0.5;
				kd_12 = (1 - k_none) * 0.5;
			} else {
				let ad_21m$11m = cubic(ad_10, ad_21m, ad_11m, ad_12m);
				k_none = max(1, ad_12$11) / max(1, ad_21m$11m);
				kd_12 = (1 - k_none) * 0.5;
				kd_11 = (1 - k_none) * 0.5;
			}
		} else if (ad_21 === m) {
			let ad_11$21 = cubic(ad_12, ad_11, ad_21, ad_10);
			let ad_21$10 =        cubic(ad_11, ad_21, ad_10, ad_21m);
			let m2 = min(ad_11$21, ad_21, ad_21$10);
			if (m2 === ad_21) {
				k_none = ad_21 / ad_12m;
				kd_21 = 1 - k_none;
			} else if (m2 === ad_11$21) {
				let ad_11m$12m = cubic(ad_21m, ad_11m, ad_12m, ad_01);
				k_none = max(1, ad_11$21) / max(1, ad_11m$12m);
				kd_11 = (1 - k_none) * 0.5;
				kd_21 = (1 - k_none) * 0.5;
			} else {
				let ad_12m$01 = cubic(ad_11m, ad_12m, ad_01, ad_12);
				k_none = max(1, ad_21$10) / max(1, ad_12m$01);
				kd_21 = (1 - k_none) * 0.5;
				kd_10 = (1 - k_none) * 0.5;
			}
		} else if (ad_12m === m) {
			let ad_11m$12m = cubic(ad_21m, ad_11m, ad_12m, ad_01);
			let ad_12m$01 = cubic(ad_11m, ad_12m, ad_01, ad_12);
			let m2 = min(ad_11m$12m, ad_12m, ad_12m$01);
			if (m2 === ad_12m) {
				k_none = ad_12m / ad_21;
				kd_12m = 1 - k_none;
			} else if (m2 === ad_11m$12m) {
				let ad_11$21 = cubic(ad_12, ad_11, ad_21, ad_10);
				k_none = max(1, ad_11m$12m) / max(1, ad_11$21);
				kd_11m = (1 - k_none) * 0.5;
				kd_12m = (1 - k_none) * 0.5;
			} else {
				let ad_21$10 = cubic(ad_11, ad_21, ad_10, ad_21m);
				k_none = max(1, ad_12m$01) / max(1, ad_21$10);
				kd_01  = (1 - k_none) * 0.5;
				kd_12m = (1 - k_none) * 0.5;
			}
		} else if (ad_21m === m) {
			let ad_10$21m = cubic(ad_21, ad_10, ad_21m, ad_11m);
			let ad_21m$11m = cubic(ad_10, ad_21m, ad_11m, ad_12m);
			let m2 = min(ad_10$21m, ad_21m, ad_21m$11m);
			if (m2 === ad_21m) {
				k_none = ad_21m / ad_12;
				kd_21m = 1 - k_none;
			} else if (m2 === ad_10$21m) {
				let ad_01$12 = cubic(ad_12m, ad_01, ad_12, ad_11);
				k_none = max(1, ad_10$21m) / max(1, ad_01$12);
				kd_10 = (1 - k_none) * 0.5;
				kd_21m = (1 - k_none) * 0.5;
			} else {
				let ad_12$11 = cubic(ad_01, ad_12, ad_11, ad_21);
				k_none =  max(1, ad_21m$11m) / max(1, ad_12$11);
				kd_21m = (1 - k_none) * 0.5;
				kd_11m = (1 - k_none) * 0.5;
			}
		}

		let value_a = 0;
		let value_b = 0;
		let value_c = 0;
		let value_d = 0;

		const gd = (w, h) => doubled_image.get(x * 2 + w, y * 2 + h, c);
		let vd = [
			gd(-2, -2), gd(-1, -2), 	gd(0, -2), gd(1, -2), 	gd(2, -2), gd(3, -2),
			gd(-2, -1), gd(-1, -1), 	gd(0, -1), gd(1, -1), 	gd(2, -1), gd(3, -1),

			gd(-2,  0), gd(-1,  0), 	gd(0,  0), gd(1,  0), 	gd(2,  0), gd(3,  0),
			gd(-2,  1), gd(-1,  1), 	gd(0,  1), gd(1,  1), 	gd(2,  1), gd(3,  1),

			gd(-2,  2), gd(-1,  2), 	gd(0,  2), gd(1,  2), 	gd(2,  2), gd(3,  2),
			gd(-2,  3), gd(-1,  3), 	gd(0,  3), gd(1,  3), 	gd(2,  3), gd(3,  3)
		];
		//  0  1  2  3  4  5
		//  6  7  8  9 10 11
		// 12 13 14 15 16 17 -> .. ab ..
		// 18 19 20 21 22 23 -> .. cd ..
		// 24 25 26 27 28 29
		// 30 31 32 33 34 35
		value_a += (k_none + kd_01 + kd_10) * vd[14];
		value_b += (k_none + kd_01 + kd_10) * vd[15];
		value_c += (k_none + kd_01 + kd_10) * vd[20];
		value_d += (k_none + kd_01 + kd_10) * vd[21];
		/*
		if (k_none) {
			value_a += k_none * (vd[ 7] + vd[ 8] + vd[ 9] + vd[13] + vd[14] + vd[14] + vd[15] + vd[19] + vd[20] + vd[21]) * 0.1;
			value_b += k_none * (vd[ 8] + vd[ 9] + vd[10] + vd[14] + vd[15] + vd[15] + vd[16] + vd[20] + vd[21] + vd[22]) * 0.1;
			value_c += k_none * (vd[13] + vd[14] + vd[15] + vd[19] + vd[20] + vd[20] + vd[21] + vd[25] + vd[26] + vd[27]) * 0.1;
			value_d += k_none * (vd[14] + vd[15] + vd[16] + vd[20] + vd[21] + vd[21] + vd[22] + vd[26] + vd[27] + vd[28]) * 0.1;
		}
		if (kd_01) {
			value_a += kd_01 * (vd[13] + vd[14] + vd[14] + vd[15]) * 0.25;
			value_b += kd_01 * (vd[14] + vd[15] + vd[15] + vd[16]) * 0.25;
			value_c += kd_01 * (vd[19] + vd[20] + vd[20] + vd[21]) * 0.25;
			value_d += kd_01 * (vd[20] + vd[21] + vd[21] + vd[22]) * 0.25;
		}
		if (kd_10) {
			value_a += kd_10 * (vd[ 8] + vd[14] + vd[14] + vd[20]) * 0.25;
			value_b += kd_10 * (vd[ 9] + vd[15] + vd[15] + vd[21]) * 0.25;
			value_c += kd_10 * (vd[14] + vd[20] + vd[20] + vd[26]) * 0.25;
			value_d += kd_10 * (vd[15] + vd[21] + vd[21] + vd[27]) * 0.25;
		}
		*/
		if (kd_11) {
			value_a += kd_11 * (vd[ 7] + vd[14] + vd[21] + vd[28]) * 0.25;
			value_b += kd_11 * (vd[ 8] + vd[15] + vd[15] + vd[22]) * 0.25;
			value_c += kd_11 * (vd[13] + vd[20] + vd[20] + vd[27]) * 0.25;
			value_d += kd_11 * (vd[ 7] + vd[14] + vd[21] + vd[28]) * 0.25;
		}
		if (kd_11m) {
			value_a += kd_11m * (vd[ 9] + vd[14] + vd[14] + vd[19]) * 0.25;
			value_b += kd_11m * (vd[10] + vd[15] + vd[20] + vd[25]) * 0.25;
			value_c += kd_11m * (vd[10] + vd[15] + vd[20] + vd[25]) * 0.25;
			value_d += kd_11m * (vd[16] + vd[21] + vd[21] + vd[26]) * 0.25;
		}
		if (kd_12) {
			value_a += kd_12 * (vd[ 6] + vd[14] + vd[14] + vd[22]) * 0.25;
			value_b += kd_12 * (vd[ 7] + vd[15] + vd[15] + vd[23]) * 0.25;
			value_c += kd_12 * (vd[12] + vd[20] + vd[20] + vd[28]) * 0.25;
			value_d += kd_12 * (vd[13] + vd[21] + vd[21] + vd[29]) * 0.25;
		}
		if (kd_21) {
			value_a += kd_21 * (vd[ 1] + vd[14] + vd[14] + vd[27]) * 0.25;
			value_b += kd_21 * (vd[ 2] + vd[15] + vd[15] + vd[28]) * 0.25;
			value_c += kd_21 * (vd[ 7] + vd[20] + vd[20] + vd[33]) * 0.25;
			value_d += kd_21 * (vd[ 8] + vd[21] + vd[21] + vd[34]) * 0.25;
		}
		if (kd_12m) {
			value_a += kd_12m * (vd[10] + vd[14] + vd[14] + vd[18]) * 0.25;
			value_b += kd_12m * (vd[11] + vd[15] + vd[15] + vd[19]) * 0.25;
			value_c += kd_12m * (vd[16] + vd[20] + vd[20] + vd[24]) * 0.25;
			value_d += kd_12m * (vd[17] + vd[21] + vd[21] + vd[25]) * 0.25;
		}
		if (kd_21m) {
			value_a += kd_21m * (vd[ 3] + vd[14] + vd[14] + vd[25]) * 0.25;
			value_b += kd_21m * (vd[ 4] + vd[15] + vd[15] + vd[26]) * 0.25;
			value_c += kd_21m * (vd[ 9] + vd[20] + vd[20] + vd[31]) * 0.25;
			value_d += kd_21m * (vd[10] + vd[21] + vd[21] + vd[32]) * 0.25;
		}

		if (and_fix) {
			let total = v[8] * 4;
			if (value_a + value_b + value_c + value_d < total) {
				let max_value = 1;
				let a_ = max_value - value_a;
				let b_ = max_value - value_b;
				let c_ = max_value - value_c;
				let d_ = max_value - value_d;
				let t_ = max_value * 4 - total;
				let k_fix = t_ / (a_ + b_ + c_ + d_);
				value_a = max_value - a_ * k_fix;
				value_b = max_value - b_ * k_fix;
				value_c = max_value - c_ * k_fix;
				value_d = max_value - d_ * k_fix;
			} else if (value_a + value_b + value_c + value_d > total) {
				let k_fix = total / (value_a + value_b + value_c + value_d);
				value_a *= k_fix;
				value_b *= k_fix;
				value_c *= k_fix;
				value_d *= k_fix;
			}
		}

		return [value_a, value_b, value_c, value_d];
	}

	let width = original_image.xRes;
	let height = original_image.yRes;
	let width_2 = doubled_image.xRes;
	let height_2 = doubled_image.yRes;
	let returned_image = doubled_image.copy();
	for (let c = 0; c < 4; c++) {
		let h, w, values,
		value_a, value_b, value_c, value_d;
		for (h = 0; h < height; h++) {
		for (w = 0; w < width; w++) {
			values = iter(original_image, w, h, c, doubled_image);
			value_b = values[1];
			value_a = values[0];
			value_c = values[2];
			value_d = values[3];
			returned_image.set(w * 2,     h * 2,     c, value_a);
			returned_image.set(w * 2 + 1, h * 2,     c, value_b);
			returned_image.set(w * 2,     h * 2 + 1, c, value_c);
			returned_image.set(w * 2 + 1, h * 2 + 1, c, value_d);
		}}
	}
	return returned_image;
}

