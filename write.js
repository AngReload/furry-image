'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');

function write(pathString, jpegQuality) {
	let dataObject = this.toObject(),
		extname = path.extname(pathString).toLowerCase(),
		dataRaw;
	switch (extname) {
		case '.png':
			dataRaw = PNG.sync.write(dataObject);
			break;
		case '.jpg':
			dataRaw = JPEG.encode(dataObject, jpegQuality || 100).data;
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
module.exports = write;