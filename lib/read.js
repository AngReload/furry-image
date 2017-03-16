'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');

function read(pathString) {
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
			dataObject = JPEG.decode(dataRaw);
			break;
		case '.bmp':
			dataObject = BMP.decode(dataRaw);
			break;
		default:
			throw new Error ('Type not support');
	}
	return this.makeFromObject(dataObject);
}

module.exports = read;
