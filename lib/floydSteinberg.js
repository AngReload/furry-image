'use strict';

const {round, min, max} = Math;

function floydSteinberg() {
	const img_temp = this.copy();
	const img_round = new this.constructor(this.width, this.height, this.components);
	const roundClamped = (v) => {
		let rounded = round(v / 255) * 255;
		let clamped = max(0, min(rounded, 255));
		return clamped;
	};

	img_temp.forEach((v, c, x, y, image) => {
		const v_rounded = roundClamped(v);
		img_round.set(c, x, y, v_rounded);
		const error = v - v_rounded;
		// error dispersion
		const right     = image.get(c, x + 1, y    ) + error * 7 / 16;
		const downRight = image.get(c, x + 1, y + 1) + error * 1 / 16;
		const down      = image.get(c, x    , y + 1) + error * 5 / 16;
		const downLeft  = image.get(c, x - 1, y + 1) + error * 3 / 16;
		image.set(c, x + 1, y    , right    );
		image.set(c, x + 1, y + 1, downRight);
		image.set(c, x    , y + 1, down     );
		image.set(c, x - 1, y + 1, downLeft );
	});

	return img_round;
}
module.exports = floydSteinberg;