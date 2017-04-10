'use strict';

module.exports = function gradient() {
	const xRes = this.xRes;
	const yRes = this.yRes;

	const canvas = new this.constructor(xRes, yRes);

	const shader = x => {
		const v = x / xRes;
		return [v, v, v, 255];
	};

	return canvas.fillColor(shader);
}
