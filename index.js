/**
 * @author AngReload
 */

'use strict';

const {abs, max, min, ceil, floor, round, random} = Math;

class FurryImage {
	constructor(width, height, components) {
		this.width = width;
		this.height = height;
		this.components = components ? Array.from(components) : ['r', 'g', 'b', 'a'];
		this.size = this.width * this.height;
		this.data = [];
		for (let c = 0; c < this.components.length; c++) {
			this.data[c] = new Float32Array(this.size);
		}
	}

	get(c, x, y) {
		x = max(0, min(x, this.width - 1));
		y = max(0, min(y, this.height - 1));
		return this.data[c][x + y * this.width];
	}

	set(c, x, y, value) {
		if (0 <= y && y < this.height && 0 <= x && x < this.width) {
			this.data[c][x + y * this.width] = value;
		}
	}

	map(fn, self) {
		let width = this.width;
		let height = this.height;
		let components = this.components;
		let returned_image = new FurryImage(width, height, components);
		for (let c = 0; c < components.length; c++) {
			for (let h = 0; h < height; h++) {
			for (let w = 0; w < width;  w++) {
				let v = this.get(c, w, h);
				returned_image.set(c, w, h, fn.call(self, v, c, w, h, this));
			}}
		}
		return returned_image;
	}

	forEach(fn, self) {
		let width = this.width;
		let height = this.height;
		let components = this.components;
		for (let c = 0; c < components.length; c++) {
			for (let h = 0; h < height; h++) {
			for (let w = 0; w < width;  w++) {
				let v = this.get(c, w, h);
				fn.call(self, v, c, w, h, this);
			}}
		}
	}

	doubling() {
		function coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3) {
			let a = abs(prev_3 - prev_2) + abs(prev_2 - prev_1) + 1,
				b = abs(prev_2 - prev_1) + abs(prev_1 - center) + 1,
				c = abs(prev_1 - center) + abs(center - next_1) + 1,
				d = abs(center - next_1) + abs(next_1 - next_2) + 1,
				e = abs(next_1 - next_2) + abs(next_2 - next_3) + 1;

			let kEdge =  c * c / ((a + c) * (c + e));
			let kSymmetry = (1 - abs(b - d) / (b + d));
			let kSeparated = kEdge * kSymmetry;

			let returned_x = center + kSeparated * (prev_1 - next_1) * 0.5;
			let returned_y = center + kSeparated * (next_1 - prev_1) * 0.5;
			return clampTwo(returned_x, returned_y, center);
		}
		
		function clampTwo(returned_x, returned_y, center) {	
			if (returned_x < 0) {
				returned_x = 0;
				returned_y = 2 * center;
			}
			if (returned_y < 0) {
				returned_y = 0;
				returned_x = 2 * center;
			}
			let max = 255;
			if (returned_x > max) {
				returned_x = max;
				returned_y = blockr - max;
			}
			if (returned_y > max) {
				returned_y = max;
				returned_x = 2 * center - max;
			}
			return [returned_x, returned_y];
		}

		function doubleWidth(image) {
			let width = image.width * 2;
			let height = image.height;
			let returned_image = new FurryImage(width, height);
			for (let c = 0; c < 4; c++) {
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
			let returned_image = new FurryImage(width, height);
			for (let c = 0; c < 4; c++) {
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
			let returned_image = new FurryImage(width, height);
			for (let c = 0; c < 4; c++) {
				for (let i = 0; i < size; i++) {
					returned_image.data[c][i] = (image1.data[c][i] + image2.data[c][i]) * 0.5;
				}
			}
			return returned_image;
		}

		function fxaa(doubled_image, original_image) {
			let width = original_image.width;
			let height = original_image.height;
			let width_2 = doubled_image.width;
			let height_2 = doubled_image.height;
			let returned_image = new FurryImage(width_2, height_2);
			for (let c = 0; c < 4; c++) {
				let h, w, values, ad_11, ad_11m, kDiagonal, isMain,
					value_a, value_b, value_c, value_d,
					smooth_a, smooth_d, smooth_b, smooth_c;
				for (h = 0; h < height; h++) {
				for (w = 0; w < width; w++) {
					ad_11 = 1 +
						abs(original_image.get(c, w, h) - original_image.get(c, w - 1, h - 1)) +
						abs(original_image.get(c, w, h) - original_image.get(c, w + 1, h + 1)) +
						abs(original_image.get(c, w, h - 1) - original_image.get(c, w + 1, h)) +
						abs(original_image.get(c, w - 1, h) - original_image.get(c, w, h + 1));
					ad_11m = 1 +
						abs(original_image.get(c, w + 1, h - 1) - original_image.get(c, w, h)) +
						abs(original_image.get(c, w, h) - original_image.get(c, w - 1, h + 1)) +
						abs(original_image.get(c, w, h - 1) - original_image.get(c, w - 1, h)) +
						abs(original_image.get(c, w + 1, h) - original_image.get(c, w, h + 1));
					// ad_11  **= 2;
					// ad_11m **= 2;

					kDiagonal = abs(ad_11 - ad_11m) / (ad_11 + ad_11m)
					isMain = ad_11 < ad_11m;
					value_a = doubled_image.get(c, w * 2,     h * 2);
					value_b = doubled_image.get(c, w * 2 + 1, h * 2);
					value_c = doubled_image.get(c, w * 2,     h * 2 + 1);
					value_d = doubled_image.get(c, w * 2 + 1, h * 2 + 1);
					if (isMain) {
						smooth_a = smooth_d = 0.5 * (value_a + value_d);
						smooth_b = 0.5 * value_b +
							0.25 * doubled_image.get(c, w * 2,     h * 2 - 1) +
							0.25 * doubled_image.get(c, w * 2 + 2, h * 2 + 1);
						smooth_c = 0.5 * value_c +
							0.25 * doubled_image.get(c, w * 2 - 1, h * 2) +
							0.25 * doubled_image.get(c, w * 2 + 1, h * 2 + 2);
					} else {
						smooth_a = 0.5 * value_a +
							0.25 * doubled_image.get(c, w * 2 + 1, h * 2 - 1) +
							0.25 * doubled_image.get(c, w * 2 - 1, h * 2 + 1);
						smooth_d = 0.5 * value_d +
							0.25 * doubled_image.get(c, w * 2 + 2, h * 2) +
							0.25 * doubled_image.get(c, w * 2,     h * 2 + 2);
						smooth_b = smooth_c = 0.5 * (value_b + value_c);
					}
					value_a = (1 - kDiagonal) * value_a + kDiagonal * smooth_a;
					value_b = (1 - kDiagonal) * value_b + kDiagonal * smooth_b;
					value_c = (1 - kDiagonal) * value_c + kDiagonal * smooth_c;
					value_d = (1 - kDiagonal) * value_d + kDiagonal * smooth_d;
					let total = original_image.get(c, w, h) * 4;
					if (value_a + value_b + value_c + value_d < total) {
						let max_value = 255;
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
					returned_image.set(c, w * 2,     h * 2, value_a);
					returned_image.set(c, w * 2 + 1, h * 2, value_b);
					returned_image.set(c, w * 2,     h * 2 + 1, value_c);
					returned_image.set(c, w * 2 + 1, h * 2 + 1, value_d);
				}}
			}
			return returned_image;
		}

		function fxsr(doubled_image, original_image, and_fix) {
			function iter(image, c, x, y, doubled_image) {
				const g = (w, h) => image.get(c, x + w, y + h);
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
					) + 1;
				// anti-dimension axis-y (1:0) test
				let ad_10 = ad(4, 8) + ad(8, 12) +
					0.5 * (
						ad(3, 7) + ad(7, 11) +
						ad(5, 9) + ad(9, 13)
					) + 1;
				// anti-dimension diagonal-main (1:1) test
				let ad_11 = ad(3, 8) + ad(8, 13) + ad(4, 9) + ad(7, 12) + 1;
				// anti-dimension diagonal-minor (1:-1) test
				let ad_11m = ad(5, 8) + ad(8, 11) + ad(4, 7) + ad(9, 12) + 1;
				// anti-dimension inclined 2 - 1
				let ad_12 = ad(2, 8) + ad(8, 14) + ad(3, 9) + ad(7, 13) + 1;
				let ad_21 = ad(0, 8) + ad(8, 16) + ad(4, 13) + ad(3, 12) + 1;
				let ad_12m = ad(6, 8) + ad(8, 10) + ad(5, 7) + ad(9, 11) + 1;
				let ad_21m = ad(1, 8) + ad(8, 15) + ad(4, 11) + ad(5, 12) + 1;
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

				const gd = (w, h) => doubled_image.get(c, x * 2 + w, y * 2 + h);
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
						let max_value = 255;
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

			let width = original_image.width;
			let height = original_image.height;
			let width_2 = doubled_image.width;
			let height_2 = doubled_image.height;
			let returned_image = new FurryImage(width_2, height_2);
			for (let c = 0; c < 4; c++) {
				let h, w, values,
				value_a, value_b, value_c, value_d;
				for (h = 0; h < height; h++) {
				for (w = 0; w < width; w++) {
					values = iter(original_image, c, w, h, doubled_image);
					value_a = values[0];
					value_b = values[1];
					value_c = values[2];
					value_d = values[3];
					returned_image.set(c, w * 2,     h * 2,     value_a);
					returned_image.set(c, w * 2 + 1, h * 2,     value_b);
					returned_image.set(c, w * 2,     h * 2 + 1, value_c);
					returned_image.set(c, w * 2 + 1, h * 2 + 1, value_d);
				}}
			}
			return returned_image;
		}


		let returned_image = merge(doubleWidth(doubleHeight(this)), doubleHeight(doubleWidth(this)));
		for (let i = 1; i <= 4; i++) {
			let and_fix = 1;
			returned_image = fxsr(returned_image, this, and_fix);
		}
		return returned_image;
	}

	supersampling(width, height) {
		if (!width && !height) {
			width = this.width;
			height = this.height;
		} else if (width && !height) {
			height = round(this.height * width / this.width) || 1;
		} else if (!width && height) {
			width = round(this.width * height / this.height) || 1;
		}
		var ratio_w = width / this.width;
		var ratio_h = height / this.height;
		var anti_ratio_w = 1 / ratio_w;
		var anti_ratio_h = 1 / ratio_h;
		var image_resized_width = new FurryImage(width, this.height);
		for (let c = 0; c < this.components.length; c++) {
			for (let h = 0; h < this.height; h++) {
				for (let w = 0; w < width; w++) {
					let windowStart = w * anti_ratio_w;
					let windowEnd = windowStart + anti_ratio_w;
					let windowStartFloor = floor(windowStart);
					let windowEndFloor = floor(windowEnd);
					let value = 0;
					if (windowStartFloor === windowEndFloor) {
						value = this.get(c, windowStartFloor, h);
					} else {
						let total = 0;
						if (windowStart % 1) {
							let k = 1 - windowStart % 1;
							total += k * this.get(c, windowStartFloor, h);
						}
						for (let input_w = ceil(windowStart); input_w < windowEndFloor; input_w++) {
							total += this.get(c, input_w, h);
						}
						if (windowEnd % 1) {
							let k = windowEnd % 1;
							total += k * this.get(c, windowEndFloor, h);
						}
						value = total * ratio_w;
					}
					image_resized_width.set(c, w, h, value);
				}
			}
		}
		var returned_image = new FurryImage(width, height);
		for (let c = 0; c < this.components.length; c++) {
			for (let h = 0; h < height; h++) {
				for (let w = 0; w < width; w++) {
					let windowStart = h * anti_ratio_h;
					let windowEnd = windowStart + anti_ratio_h;
					let windowStartFloor = floor(windowStart);
					let windowEndFloor = floor(windowEnd);
					let value = 0;
					if (windowStartFloor === windowEndFloor) {
						value = image_resized_width.get(c, w, windowStartFloor);
					} else {
						let total = 0;
						if (windowStart % 1) {
							let k = 1 - windowStart % 1;
							total += k * image_resized_width.get(c, w, windowStartFloor);
						}
						for (let input_h = ceil(windowStart); input_h < windowEndFloor; input_h++) {
							total += image_resized_width.get(c, w, input_h);
						}
						if (windowEnd % 1) {
							let k = windowEnd % 1;
							total += k * image_resized_width.get(c, w, windowEndFloor);
						}
						value = total * ratio_h;
					}
					returned_image.set(c, w, h, value);
				}
			}
		}
		return returned_image;
	}

	horizontalBlur(size) {
		let ceil_size = ceil(size);
		let matrix = Array(ceil_size);
		for (let i = 0; i < ceil_size; i++) {
			let fract_size = size - i;
			if (fract_size > i) {
				matrix[i] = 1;
			} else {
				matrix[i] = fract_size;
			}
		}
		let fract_size = size - floor_size;
		let width = image.width;
		let height = image.height;
		let components = image.components;
		let returned_image = new FurryImage(width, height, components);
		for (let c = 0; c < components.length; c++) {
			for (let h = 0; h < height; h++) {
			for (let w = 0; w < width;  w++) {
				let summ = 0;
				for (let i = 0; i < matrix.length; i++) {
					summ += image.get(c, w + i, h) * matrix[i];
				}
				returned_image.set(c, w, h, summ / size);
			}}
		}
		return returned_image;
	}

	supersamplingBlur(width, height) {
		var ratio_w = this.width / width;
		var ratio_h = this.height / height;
		var anti_ratio_w = 1 / ratio_w;
		var anti_ratio_h = 1 / ratio_h;
		var image_resized_width = this.supersampling(width, this.height);




		return returned_image;
	}

	doubling_b(iters) {
		iters = iters >= 0 ? round(iters) : 8;
		function coreAxis(prev_3, prev_2, prev_1, center, next_1, next_2, next_3) {
			let a = abs(prev_3 - prev_2) + abs(prev_2 - prev_1) + 1,
				b = abs(prev_2 - prev_1) + abs(prev_1 - center) + 1,
				c = abs(prev_1 - center) + abs(center - next_1) + 1,
				d = abs(center - next_1) + abs(next_1 - next_2) + 1,
				e = abs(next_1 - next_2) + abs(next_2 - next_3) + 1;

			let kEdge =  c * c / ((a + c) * (c + e));
			let kSymmetry = (1 - abs(b - d) / (b + d));
			let kSeparated = kEdge * kSymmetry;

			let returned_x = center + kSeparated * (prev_1 - next_1) * 0.5;
			let returned_y = center + kSeparated * (next_1 - prev_1) * 0.5;
			return clampTwo(returned_x, returned_y, center);
		}
		
		function clampTwo(returned_x, returned_y, center) {	
			if (returned_x < 0) {
				returned_x = 0;
				returned_y = 2 * center;
			}
			if (returned_y < 0) {
				returned_y = 0;
				returned_x = 2 * center;
			}
			let max = 255;
			if (returned_x > max) {
				returned_x = max;
				returned_y = 2 * center - max;
			}
			if (returned_y > max) {
				returned_y = max;
				returned_x = 2 * center - max;
			}
			return [returned_x, returned_y];
		}

		function doubleWidth(image) {
			let width = image.width * 2;
			let height = image.height;
			let returned_image = new FurryImage(width, height);
			for (let c = 0; c < 4; c++) {
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
			let returned_image = new FurryImage(width, height);
			for (let c = 0; c < 4; c++) {
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
			let components = image1.components;
			let returned_image = new FurryImage(width, height, components);
			for (let c = 0; c < components.length; c++) {
				for (let i = 0; i < size; i++) {
					returned_image.data[c][i] = (image1.data[c][i] + image2.data[c][i]) * 0.5;
				}
			}
			return returned_image;
		}

		function fix(image, original) {
			let width = original.width;
			let height = original.height;
			let components = original.components;
			let returned_image = new FurryImage(width * 2, height * 2, components);
			for (let c = 0; c < components.length; c++) {
				for (let h = 0; h < height; h++) {
				for (let w = 0; w < width;  w++) {
					let total = 4 * original.get(c, w, h);
					let w2 = w * 2;
					let h2 = h * 2;
					let value_a = image.get(c, w2 + 0, h2 + 0);
					let value_b = image.get(c, w2 + 1, h2 + 0);
					let value_c = image.get(c, w2 + 0, h2 + 1);
					let value_d = image.get(c, w2 + 1, h2 + 1);
					let summ = value_a + value_b + value_c + value_d
					if (summ > total) {
						let k_fix = total / summ;
						value_a *= k_fix;
						value_b *= k_fix;
						value_c *= k_fix;
						value_d *= k_fix;
					} else if (summ < total) {
						let max_value = 255;
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
					}
					returned_image.set(c, w2 + 0, h2 + 0, value_a);
					returned_image.set(c, w2 + 1, h2 + 0, value_b);
					returned_image.set(c, w2 + 0, h2 + 1, value_c);
					returned_image.set(c, w2 + 1, h2 + 1, value_d);
				}}
			}
			return returned_image;
		}

		function blur(image) {
			let width = image.width;
			let height = image.height;
			let components = image.components;
			let returned_image = new FurryImage(width, height, components);
			for (let c = 0; c < components.length; c++) {
				for (let h = 0; h < height; h++) {
				for (let w = 0; w < width;  w++) {
					let summ = 0 +
						image.get(c, w - 0, h - 1) +
						image.get(c, w - 1, h - 0) +
						image.get(c, w - 0, h - 0) +
						image.get(c, w + 1, h - 0) +
						image.get(c, w - 0, h + 1);
					returned_image.set(c, w, h, summ / 5);
				}}
			}
			return returned_image;
		}

		function directionalBlur(image) {
			let width = image.width;
			let height = image.height;
			let components = image.components;
			let returned_image = new FurryImage(width, height, components);
			for (let c = 0; c < components.length; c++) {
				for (let h = 0; h < height; h++) {
				for (let w = 0; w < width;  w++) {
					var center = image.get(c, w + 0, h + 0);
					// 0 1 2
					// 3   4
					// 5 6 7
					var area = [
						image.get(c, w - 1, h - 1),
						image.get(c, w + 0, h - 1),
						image.get(c, w + 1, h - 1),
						image.get(c, w - 1, h + 0),
						image.get(c, w + 1, h + 0),
						image.get(c, w - 1, h + 1),
						image.get(c, w + 0, h + 1),
						image.get(c, w + 1, h + 1)
					];
					var ad_area = area.map(k => abs(k - center) + 1);
					var max_ad = ad_area.reduce((a, b) => max(a, b), 1);
					var k_area = ad_area.map(k => 1 - k / max_ad);
					var total_value = center + area.reduce((a, b, i) => a + b * k_area[i], 0);
					var value = total_value / k_area.reduce((a, b) => a + b, 1);
					returned_image.set(c, w, h, value);
				}}
			}
			return returned_image;
		}

		function edgeBlur(image) {
			const deceleration = 0.5;
			const mad_error = 2;
			let width = image.width;
			let height = image.height;
			let components = image.components;
			let returned_image = new FurryImage(width, height, components);
			for (let c = 0; c < components.length; c++) {
				for (let h = 0; h < height; h++) {
				for (let w = 0; w < width;  w++) {
					var center = image.get(c, w + 0, h + 0);
					// 0 1 2
					// 3   4
					// 5 6 7
					var area = [
						image.get(c, w - 1, h - 1),
						image.get(c, w + 0, h - 1),
						image.get(c, w + 1, h - 1),
						image.get(c, w - 1, h + 0),
						image.get(c, w + 1, h + 0),
						image.get(c, w - 1, h + 1),
						image.get(c, w + 0, h + 1),
						image.get(c, w + 1, h + 1)
					];
					var directions = [
						[0, 1, 2, 3, 5],
						[0, 1, 2, 3, 4],
						[0, 1, 2, 4, 7],
						[1, 2, 4, 6, 7],
						[2, 4, 5, 6, 7],
						[3, 4, 5, 6, 7],
						[0, 3, 5, 6, 7],
						[0, 1, 3, 5, 6]
					];
					var mad = idx => abs(area[idx] - center) + mad_error;
					var antiDirection = directions.map(ds => ds.reduce((acc, idx) => acc + mad(idx), 0));
					var max_ad = antiDirection.reduce((a, b) => max(a, b), 0);
					var k_directions = antiDirection.map(ad => 1 - ad / max_ad);
					var mdv = idx => 1/6 * directions[idx].reduce((acc, idx) => acc + area[idx], center);
					var total_value = center * deceleration + k_directions.reduce((acc, k, idx) => acc + k * mdv(idx), 0);
					var value = total_value / k_directions.reduce((a, b) => a + b, deceleration);
					returned_image.set(c, w, h, value);
				}}
			}
			return returned_image;
		}

		let returned_image = merge(doubleWidth(doubleHeight(this)), doubleHeight(doubleWidth(this)));
		while (iters--) returned_image = fix(edgeBlur(returned_image), this);
		return returned_image;
	}
}

FurryImage.makeFromObject = require('./makeFromObject.js');
FurryImage.read = require('./read.js');
FurryImage.prototype.toObject = require('./toObject.js');
FurryImage.prototype.write = require('./write.js');
FurryImage.prototype.crop = require('./crop.js');
FurryImage.prototype.blockSubsampling = require('./blockSubsampling.js');
FurryImage.prototype.blockAveraging = require('./blockAveraging.js');
FurryImage.prototype.multiplyTrivial = require('./multiplyTrivial.js');
FurryImage.prototype.fixBase = require('./fixBase.js');
FurryImage.prototype.doublingRandom = require('./doublingRandom.js');
FurryImage.prototype.doublingBilinear = require('./doublingBilinear.js');
FurryImage.prototype.doublingFurry = require('./doublingFurry.js');

module.exports = FurryImage;