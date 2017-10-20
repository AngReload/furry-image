'use strict';

module.exports = function edgeDetect(image) {
	return image.map((v, x, y, z, img) => {
		if (z < 3) {
			const ae0 = Math.abs(img.get(x - 1, y - 1, z) - v);
			const ae1 = Math.abs(img.get(x + 0, y - 1, z) - v);
			const ae2 = Math.abs(img.get(x + 1, y - 1, z) - v);
			const ae3 = Math.abs(img.get(x - 1, y + 0, z) - v);
			const ae4 = Math.abs(img.get(x + 1, y + 0, z) - v);
			const ae5 = Math.abs(img.get(x - 1, y + 1, z) - v);
			const ae6 = Math.abs(img.get(x + 0, y + 1, z) - v);
			const ae7 = Math.abs(img.get(x + 1, y + 1, z) - v);
			const ame = (ae0 + ae1 + ae2 + ae3 + ae4 + ae5 + ae6 + ae7) / 8;
			return ame;
		} else { return v };
	});
}
