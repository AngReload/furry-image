'use strict';
const {toLinear} = require('./../utils');
const {ceil} = Math;

module.exports = function gradient(isLinear) {
	const xRes = this.xRes;
	const yRes = this.yRes;

	const canvas = new this.constructor(xRes, yRes);

	const shader = isLinear ? (x => x / xRes) : (x => toLinear(x / xRes));

	return canvas.fill(shader);
}
