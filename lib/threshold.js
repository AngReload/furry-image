'use strict';

const {toLuma} = require('./color.js');

module.exports = function threshold(image, t) {

	const filter = ([r, g, b, a]) => {
		const l = toLuma(r, g, b);
		var v = (l >= t) ? 1 : 0;
		return [v, v, v, a];
	};
	return image.mapColor(filter);
}
