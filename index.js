'use strict';

/**
 * class FurryImage
 * for resizing images
 * @author AngReload
 */

class FurryImage {
	constructor(width, height, components = ['r', 'g', 'b', 'a']) {
		this.width = width;
		this.height = height;
		this.components = [...components];
		this.size = this.width * this.height;
		this.data = [];
		for (let c = 0; c < this.components.length; c++) {
			this.data[c] = new Float32Array(this.size);
		}
	}

	get(c, x, y) {
		const {min, max} = Math;
		const xClamped = max(0, min(x, this.width - 1));
		const yClamped = max(0, min(y, this.height - 1));
		return this.data[c][xClamped + yClamped * this.width];
	}

	set(c, x, y, value) {
		if (0 <= y && y < this.height && 0 <= x && x < this.width) {
			this.data[c][x + y * this.width] = value;
		}
	}

	map(fn, self) {
		const width = this.width;
		const height = this.height;
		const components = this.components;
		const image = new this.constructor(width, height, components);
		for (let c = 0; c < components.length; c++) {
			for (let h = 0; h < height; h++) {
				for (let w = 0; w < width; w++) {
					const v = this.get(c, w, h);
					image.set(c, w, h, fn.call(self, v, c, w, h, this));
				}
			}
		}

		return image;
	}

	forEach(fn, self) {
		const width = this.width;
		const height = this.height;
		const components = this.components;
		for (let c = 0; c < components.length; c++) {
			for (let h = 0; h < height; h++) {
				for (let w = 0; w < width; w++) {
					const v = this.get(c, w, h);
					fn.call(self, v, c, w, h, this);
				}
			}
		}
	}
}

// extend static
const staticProperties = [
	'makeFromObject',
	'read',
];

for (let name of staticProperties) {
	FurryImage[name] = require(`./lib/${name}.js`);
}

// extend prototype
const prototypeProperties = [
	'toObject',
	'write',
	'crop',
	'blockSubsampling',
	'blockAveraging',
	'multiplyTrivial',
	'fixBase',
	'doublingRandom',
	'doublingBilinear',
	'doublingFurry',
];

for (let name of prototypeProperties) {
	FurryImage.prototype[name] = require(`./lib/${name}.js`);
}

module.exports = FurryImage;
