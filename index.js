'use strict';

/**
 * lib FurryImage
 * for processing images
 * @author AngReload
 */
module.exports = {
	Image: require('./lib/Image.js'),
	open: require('./lib/open.js'),
	save: require('./lib/save.js'),
	color: require('./lib/color.js'),
	
	crop: require('./lib/crop.js'),
	
	grey: require('./lib/grey.js'),
	sepia: require('./lib/sepia.js'),
	threshold: require('./lib/threshold.js'),
	edgeDetect: require('./lib/edgeDetect.js'),

	supersampling: require('./lib/supersampling.js'),
	blockAveraging: require('./lib/blockAveraging.js'),
	blockSumming: require('./lib/blockSumming.js'),
	blockSubsampling: require('./lib/blockSubsampling.js'),
	doublingBilinear: require('./lib/doublingBilinear.js'),
	doublingRandom: require('./lib/doublingRandom.js'),
	multiplyTrivial: require('./lib/multiplyTrivial.js'),
	doublingFurry: require('./lib/doublingFurry.js'),
	invert: require('./lib/invert.js'),
	negative: require('./lib/negative.js'),
	gammaCompress: require('./lib/gammaCompress.js'),
	gammaExpand: require('./lib/gammaExpand.js'),
	sierraLite: require('./lib/sierraLite.js'),

	convolution: {
		convolve: require('./lib/convolution/convolve.js'),
		kernels: require('./lib/convolution/kernels.json'),
		kernelBlurCircle: require('./lib/convolution/kernelBlurCircle.js'),
		blurSquare: require('./lib/convolution/blurSquare.js'),
		blurGaussian: require('./lib/convolution/blurGaussian.js'),
		bicubic: require('./lib/convolution/bicubic.js'),
	},

	pipe: function (...options) {
		return function (input) {
			let result = input;
			for (let option of options) {
				const [fn, ...args] = option;
				result = fn(result, ...args);
			}
			return result;
		}
	}
};

