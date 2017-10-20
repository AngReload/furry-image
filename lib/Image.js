'use strict';

/**
 * Универсальный класс изображения FurryImage
 * @author AngReload
 */
class Image {
	/**
	 * Создает изображение заполненное нулями
	 * @param {number} xRes - Ширина
	 * @param {number} yRes - Высота
	 * @param {number} zRes - Количество компонент цвета
	 * @param ac - Конструктор массива значений
	 */
	constructor(xRes = 512, yRes = 256, zRes = 4, ac = Float32Array) {
		this.xRes = xRes;
        this.yRes = yRes;
		this.zRes = zRes;
		this.ac = ac;
		this.data = new ac(xRes * yRes * zRes);
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
		return this.data[(xClamped + yClamped * this.xRes) * this.zRes + z];
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
		const idx = (x + y * this.xRes) * this.zRes;
		const color = Array(this.zRes);
		for (let i = 0; i < this.zRes; i++) {
			color[i] = this.data[idx + i];
		}
		return color;
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
			this.data[(x + y * this.xRes) * this.zRes + z] = v;
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
			for (let z = 0; z < this.zRes; z++) {
				this.data[(x + y * this.xRes) * this.zRes + z] = color[z];		
			}
		}
	}

	/**
	 * Возвращает изображение-результат покомпонентного вызова функции
	 * @param {function} fn - Принимаемая функция
	 * @returns {FurryImage}
	 */
	fill(fn) {
		const image = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < this.zRes; z++) {
					const v = fn(x, y, z, this);
					image.set(x, y, z, v);
				}
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат поцветного вызова функции
	 * @param {function} fn - Принимаемая функция
	 * @returns {FurryImage}
	 */
	fillColor(fn) {
		const image = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = fn(x, y, this);
				image.setColor(x, y, color);
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат применения функции к компонентам изображения
	 * @param {function} fn - Функция, создающая значения нового изображения
	 * @returns {FurryImage}
	 */
	map(fn) {
		const image = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < this.zRes; z++) {
					const v = this.get(x, y, z);
					const modifedValue = fn(v, x, y, z, this);
					image.set(x, y, z, modifedValue);
				}
			}
		}

		return image;
	}

	/**
	 * Возвращает изображение-результат применения функции к цветам изображения
	 * @param {function} fn - Функция, создающая значения нового изображения
	 * @returns {FurryImage}
	 */
	mapColor(fn) {
		const image = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = this.getColor(x, y);
				const modifedColor = fn(color, x, y, this);
				image.setColor(x, y, modifedColor);
			}
		}

		return image;
	}

	/**
	 * Применяет функцию к каждому значению изображения
	 * @param {function} fn - Функция
	 */
	forEach(fn) {
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				for (let z = 0; z < this.zRes; z++) {
					const v = this.get(x, y, z);
					fn(v, x, y, z, this);
				}
			}
		}
	}

	/**
	 * Применяет функцию к каждому цвету изображения
	 * @param {function} fn - Функция
	 */
	forEachColor(fn) {
		const image = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		for (let y = 0; y < this.yRes; y++) {
			for (let x = 0; x < this.xRes; x++) {
				const color = this.getColor(x, y);
				fn(color, x, y, this);
			}
		}
	}

	/**
	 * Возвращает копию изображения
	 * @returns {FurryImage}
	 */
	copy() {
		const blank = new this.constructor(this.xRes, this.yRes, this.zRes, this.ac);
		blank.data = this.data.slice();
		return blank;
	}
}

module.exports = Image;
