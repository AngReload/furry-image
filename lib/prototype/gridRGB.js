'use strict';

module.exports = function gridRGB(isProportionally = true) {
	const input = isProportionally ? this.blockAveraging(1, 3) : this;

	return input;
};