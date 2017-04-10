'use strict';


module.exports = function fromObject({width, height, data}) {
	const {toLinear} = this.color;
	
	const xRes = width;
	const yRes = height;

	const image = new this(xRes, yRes);

	const size = xRes * yRes * 4;

	for (let i = 0; i < size;) {
		image.data[i] = toLinear(data[i++] / 255);
		image.data[i] = toLinear(data[i++] / 255);
		image.data[i] = toLinear(data[i++] / 255);
		image.data[i] = data[i++] / 255;
	}

	return image;
};
