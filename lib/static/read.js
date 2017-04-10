'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');

const JPEG_CHROMA_HQ = require('./jpeg-js-chroma-hq');

module.exports = function read(pathString, chromaHQ = true) {
	if (fs.existsSync(pathString) != true) {
		throw new Error ('File not found');
	}

	const extname = path.extname(pathString).toLowerCase();
	const dataRaw = fs.readFileSync(pathString);
	let dataObject;
	
	switch (extname) {
		case '.png':
			dataObject = PNG.sync.read(dataRaw);
			break;
		case '.jpg':
			if (chromaHQ) {
				dataObject = JPEG_CHROMA_HQ.decode(dataRaw)
			} else {
				dataObject = JPEG.decode(dataRaw);
			}
			break;
		case '.bmp':
			dataObject = BMP.decode(dataRaw);
			break;
		default:
			throw new Error ('Type not support');
	}

	return this.fromObject(dataObject);
}
