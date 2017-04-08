'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');

module.exports = function write(pathString, jpegQuality = 100) {
	const dataObject = this.toObject();
	const extname = path.extname(pathString).toLowerCase();
	let dataRaw;

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
	return this;
}
