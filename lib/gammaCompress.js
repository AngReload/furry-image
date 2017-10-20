const {toGamma, clampTo8bit} = require('./color.js');
const Image = require('./Image.js');

module.exports = function gammaCompress(iLRGBA) {

    const converter = (color) => {
        return color.map(function (v, i) {
            if (i < 3) {
                return clampTo8bit(toGamma(v) * 255);
            } else {
                return clampTo8bit(v * 255);
            }
        });
    };

    const iSRGBA = new Image(iLRGBA.xRes, iLRGBA.yRes, 4, Float32Array)
        .fillColor((x, y) => {
            const cLRGBA = iLRGBA.getColor(x, y);
            const cSRGBA = converter(cLRGBA);
            return cSRGBA;
        });

    return iSRGBA;
};