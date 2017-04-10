'use strict';

module.exports = function doublingFurrySoft() {
	const doubled = this.doublingFurry();

	// bluring
	const xRes = doubled.xRes;
	const yRes = doubled.yRes;

	const soft = new this.constructor(xRes, yRes).fill((x, y, z) => {
		const a = doubled.get(x    , y    , z);
		const b = doubled.get(x + 1, y    , z);
		const c = doubled.get(x    , y + 1, z);
		const d = doubled.get(x + 1, y + 1, z);
		return (a + b + c + d) / 4;
	});

	return soft;
};
