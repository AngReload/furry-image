'use strict';

module.exports = function convolve(image, kernel) {

	const kernelWidth = kernel.matrix[0].length;
	const kernelHeight = kernel.matrix.length;
	const ratio = (kernel.multiplier || 1) / (kernel.divisor || 1);

	return image.fill((x, y, z, img) => {
		let acc = 0;
		for (var h = 0; h < kernelHeight; h++) {
			for (let w = 0; w < kernelWidth; w++) {
				const value = img.get(x + w - kernel.xOrigin, y + h - kernel.yOrigin, z);
				const coeff = kernel.matrix[h][w];
				acc += value * coeff * ratio;
			}
		}
		return acc;
	});
};
