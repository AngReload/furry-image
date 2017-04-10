'use strict';

/**
 * class FurryImage
 * for resizing images
 * @author AngReload
 */
class FurryImage {
	/**
	 * Создает изображение заполненное нулями
	 * @param {number} x - Ширина, в пикселях
	 * @param {number} y - Высота, в пикселях
	 */
	constructor(xRes = 1, yRes = 1) {
		this.xRes = xRes;
		this.yRes = yRes;
		this.data = new Float32Array(xRes * yRes * 4);
	}

	/**
	 * Возвращает компоненту
	 * @param {number} x - Колонка
	 * @param {number} y - Строка
	 * @param {number} z - Слой
	 * @returns {number} - Значение
	 */
	get(x, y, z) {
		const {min, max} = Math;
		const xClamped = max(0, min(x, this.xRes - 1));
		const yClamped = max(0, min(y, this.yRes - 1));
		return this.data[(xClamped + yClamped * this.xRes) * 4 + z];
	}

	/**
	 * Возвращает цвет
	 * @param {number} x - Колонка
	 * @param {number} y - Строка
	 * @param {number} z - Слой
	 * @returns {array} - Значения
	 */
	getColor(x, y) {
		const {min, max} = Math;
		const xClamped = max(0, min(x, this.xRes - 1));
		const yClamped = max(0, min(y, this.yRes - 1));
		const idx = (xClamped + yClamped * this.xRes) * 4;
		return this.data.slice(idx, idx + 4);
	}

	/**
	 * Устанавливает компоненту
	 * @param {number} x - Колонка
	 * @param {number} y - Строка
	 * @param {number} z - Слой
	 * @param {number} v - Значение
	 */
	set(x, y, z, v) {
		if (0 <= y && y < this.yRes &&
			0 <= x && x < this.xRes) {
			this.data[(x + y * this.xRes) * 4 + z] = v;
		}
	}

	/**
	 * Устанавливает цвет
	 * @param {number} x - Колонка
	 * @param {number} y - Строка
	 * @param {number} z - Слой
	 * @param {number} v - Значение
	 */
	setColor(x, y, color) {
		if (0 <= y && y < this.yRes &&
			0 <= x && x < this.xRes) {
			for (let z = 0; z < 4; z++) {
				this.data[(x + y * this.xRes) * 4 + z] = color[z];		
			}
		}
	}

	/**
	 * Возвращает изображение-результат вызовов функции
	 * @param {function} fn - Принимаемая функция
	 * @param {Object} self - Объект this для fn
	 * @returns {FurryImage}
	 */
	fill(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < 4; z++) {
					const v = fn.call(self, x, y, z, this);
					image.set(x, y, z, v);
				}
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат вызовов функции
	 * @param {function} fn - Принимаемая функция
	 * @param {Object} self - Объект this для fn
	 * @returns {FurryImage}
	 */
	fillColor(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = fn.call(self, x, y, this);
				image.setColor(x, y, color);
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат последовательного применения функции
	 * @param {function} fn - Функция, создающая значения нового изображения
	 * @param {Object} self - Объект this для fn
	 * @returns {FurryImage}
	 */
	map(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < 4; z++) {
					const v = this.get(x, y, z);
					const modifedValue = fn.call(self, v, x, y, z, this);
					image.set(x, y, z, modifedValue);
				}
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат последовательного применения функции
	 * @param {function} fn - Функция, создающая значения нового изображения
	 * @param {Object} self - Объект this для fn
	 * @returns {FurryImage}
	 */
	mapColor(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = this.getColor(x, y);
				const modifedColor = fn.call(self, color, x, y, this);
				image.setColor(x, y, modifedColor);
			}
		}

		return image;
	}

	/**
	 * Применяет функцию к каждому значению изображения
	 * @param {function} fn - Функция
	 * @param {Object} self - Объект this для fn
	 */
	forEach(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < 4; z++) {
					const v = this.get(x, y, z);
					fn.call(self, v, x, y, z, this);
				}
			}
		}
	}

	/**
	 * Применяет функцию к каждому цвету изображения
	 * @param {function} fn - Функция
	 * @param {Object} self - Объект this для fn
	 */
	forEachColor(fn, self) {
		const image = new this.constructor(this.xRes, this.yRes);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = this.getColor(x, y);
				fn.call(self, color, x, y, this);
			}
		}
	}

	/**
	 * Возвращает копию изображения
	 * @returns {FurryImage}
	 */
	copy() {
		const blank = new this.constructor(this.xRes, this.yRes);
		blank.data = this.data.slice();
		return blank;
	}
}

// extend static
const staticProperties = [
	'color',
	'fromObject',
	'read',
	'ameIndex',
];

for (let name of staticProperties) {
	FurryImage[name] = require(`./static/${name}.js`);
}

// extend prototype
const prototypeProperties = [
	'toObject',
	'write',
	'crop',
	'blockSumming',
	'blockAveraging',
	'blockSubsampling',
	'multiplyTrivial',
	'doublingRandom',
	'doublingBilinear',
	'doublingFurry',
	'doublingFurrySoft',
	'gradient',
];

for (let name of prototypeProperties) {
	FurryImage.prototype[name] = require(`./prototype/${name}.js`);
}

module.exports = FurryImage;
