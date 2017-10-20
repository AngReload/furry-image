'use strict';

const {toLuma} = require('./color.js');

module.exports = function grey(image) {
	if (!image) return (image) => grey(image);

	const filter = ([r, g, b, a]) => {
		const l = toLuma(r, g, b);
		return [l, l, l, a];
	};
	return image.mapColor(filter);
}
