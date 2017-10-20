'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');
const {clampTo8bit} = require('./color.js');

/**
 * @argument image
 * @argument {string} pathString
 */
module.exports = function save(image, pathString) {
	const dataObject = {
        width: image.xRes,
        height: image.yRes,
        data: image.data.map(clampTo8bit)
    };

	const extname = path.extname(pathString).toLowerCase();
	let dataRaw;
	let jpegQuality = 100;

	switch (extname) {
		case '.png':
			dataObject.data = Buffer.from(dataObject.data);
			dataRaw = PNG.sync.write(dataObject);
			break;
		case '.jpg':
			dataRaw = JPEG.encode(dataObject, jpegQuality).data;
			break;
		case '.bmp':
			dataRaw = BMP.encode(dataObject).data;
			break;
		default:
			throw new Error ('Type not support');
	}

	fs.writeFileSync(pathString, dataRaw);
	return image;
}