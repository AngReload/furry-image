'use strict';

const fs   = require('fs');
const path = require('path');
const PNG  = require('pngjs').PNG;
const JPEG = require('jpeg-js');
const BMP  = require('bmp-js');

const Image = require('./Image.js');

const JPEG_CHROMA_HQ = require('jpeg-js-chroma-hq');

/**
 * @argument {string} pathString
 */
module.exports = function open(pathString) {
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
			dataObject = JPEG_CHROMA_HQ(dataRaw);
			break;
		case '.bmp':
			dataObject = BMP.decode(dataRaw);
			break;
		default:
			throw new Error ('Type not support');
    }
    
    const image = new Image(dataObject.width, dataObject.height, 4, Float32Array);
    image.data = new Float32Array(dataObject.data);

	return image;
}