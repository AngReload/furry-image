'use strict';

const abs = Math.abs;

function doublingFurry() {
	const FurryImage = this.constructor;

	function coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3) {
		// if Edge in center X == left, Y == right, else X == Y == center
		// Edge if prev_3 == prev_2 == prev_1 AND next_1 == next_2 == next_3
		// ... AND prev_1 !== center OR next_1 !== center
		// Edge simmetry if (prev_1 - center) == (next_1 - center)
		// =>
		let a = abs(prev_3 - prev_2) + abs(prev_2 - prev_1) + 1,
			b = abs(prev_2 - prev_1) + abs(prev_1 - center) + 1,
			c = abs(prev_1 - center) + abs(center - next_1) + 1,
			d = abs(center - next_1) + abs(next_1 - next_2) + 1,
			e = abs(next_1 - next_2) + abs(next_2 - next_3) + 1;
		let kEdge = c * c / ((a + c) * (c + e));
		let kSymmetry = (1 - abs(b - d) / (b + d));
		let kSeparated = kEdge * kSymmetry;
		// summ = 2 * center
		//  left similarity: X == prev_1, Y == summ - X
		// right similarity: Y == next_1, X == summ - Y
		// centred edge: X == (lsX + rsX) / 2, Y  == (lsY + rsY) / 2
		// edge X == (lsX + rsX) / 2 == (prev_1 + 2 * center - next_1) / 2
		// edge Y == (lsX + rsX) / 2 == (next_1 + 2 * center - prev_1) / 2
		// ... == center + (prev_1 - next_1) / 2
		// ... == center + (next_1 - prev_1) / 2
		// left- or right-edge or no-edge: X === center, Y === center
		// X == (1 - kSeparated) * center + kSeparated * (center + (prev_1 - next_1) / 2);
		// Y == (1 - kSeparated) * center + kSeparated * (center + (next_1 - prev_1) / 2);
		// => 
		let returned_x = center + kSeparated * (prev_1 - next_1) / 2;
		let returned_y = center + kSeparated * (next_1 - prev_1) / 2;
		return clampTwo(returned_x, returned_y, center);
	}
	
	function clampTwo(x, y, average) {
		let summ = 2 * average;
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
		let returned_image = new FurryImage(width, height, image.components);
		for (let c = 0; c < image.components.length; c++) {
			let h, w, prev_3, prev_2, prev_1, center, next_1, next_2, next_3, values;
			for (h = 0; h < image.height; h++) {
			for (w = 0; w < image.width; w++) {
				prev_3 = image.get(c, w - 3, h);
				prev_2 = image.get(c, w - 2, h);
				prev_1 = image.get(c, w - 1, h);
				center = image.get(c, w, h);
				next_1 = image.get(c, w + 1, h);
				next_2 = image.get(c, w + 2, h);
				next_3 = image.get(c, w + 3, h);
				values = coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3);
				returned_image.set(c, w * 2,     h, values[0]);
				returned_image.set(c, w * 2 + 1, h, values[1]);
			}}
		}
		return returned_image;
	}

	function doubleHeight(image) {
		let width = image.width;
		let height = image.height * 2;
		let returned_image = new FurryImage(width, height, image.components);
		for (let c = 0; c < image.components.length; c++) {
			let h, w, prev_3, prev_2, prev_1, center, next_1, next_2, next_3, values;
			for (h = 0; h < image.height; h++) {
			for (w = 0; w < image.width; w++) {
				prev_3 = image.get(c, w, h - 3);
				prev_2 = image.get(c, w, h - 2);
				prev_1 = image.get(c, w, h - 1);
				center = image.get(c, w, h);
				next_1 = image.get(c, w, h + 1);
				next_2 = image.get(c, w, h + 2);
				next_3 = image.get(c, w, h + 3);
				values = coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3);
				returned_image.set(c, w, h * 2    , values[0]);
				returned_image.set(c, w, h * 2 + 1, values[1]);
			}}
		}
		return returned_image;
	}

	function merge(image1, image2) {
		let width = image1.width;
		let height = image1.height;
		let size = image1.size;
		let returned_image = new FurryImage(width, height, image1.components);
		for (let c = 0; c < image1.components.length; c++) {
			for (let i = 0; i < size; i++) {
				returned_image.data[c][i] = (image1.data[c][i] + image2.data[c][i]) * 0.5;
			}
		}
		return returned_image;
	}

	let returned_image = merge(doubleWidth(doubleHeight(this)), doubleHeight(doubleWidth(this)));

	return returned_image;
}
module.exports = doublingFurry;