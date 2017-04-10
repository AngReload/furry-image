'use strict';

module.exports = function doublingFurry() {
	const abs = Math.abs;
	const eps = 1 / 255;

	const FurryImage = this.constructor;

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

		const output = new FurryImage(xRes, yRes);

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

		const output = new FurryImage(xRes, yRes);

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

		const output = new FurryImage(xRes, yRes).fill((x, y, z) => {
			const vA = imageA.get(x, y, z);
			const vB = imageB.get(x, y, z);
			return (vA + vB) / 2;
		});

		return output;
	}

	const axsisImage = merge(
		doubleX(doubleY(this)),
		doubleY(doubleX(this))
	);

	return axsisImage;
};
