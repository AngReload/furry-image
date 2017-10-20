'use strict';

const blurSquare = require('./blurSquare.js');

module.exports = function blurGaussian(image, radius) {	
	let result = image;

	for (var i = 0; i < 4; i++) {
		result = blurSquare(result, radius);
	}

	return result;
};
