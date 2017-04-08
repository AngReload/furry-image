'use strict';

function supersampling(width = 1, height = 1) {
	var ratio_w = width / this.width;
	var ratio_h = height / this.height;
	var anti_ratio_w = 1 / ratio_w;
	var anti_ratio_h = 1 / ratio_h;
	var image_resized_width = new this.constructor(width, this.height);
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
		}}
	}

	var returned_image = new this.constructor(width, height);
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
