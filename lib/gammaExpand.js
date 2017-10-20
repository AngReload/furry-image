const {toLinear} = require('./color.js');
const Image = require('./Image.js');

module.exports = function gammaExpand(iSRGBA) {

    const converter = (color) => {
        return color.map(function (v, i) {
            if (i < 3) {
                return toLinear(v / 255);
            } else {
                return (v / 255);
            }
        });
    };

    const iLRGBA = new Image(iSRGBA.xRes, iSRGBA.yRes, 4, Float32Array)
        .fillColor((x, y) => {
            const cSRGBA = iSRGBA.getColor(x, y);
            const cLRGBA = converter(cSRGBA);
            return cLRGBA;
        });

    return iLRGBA;
};
