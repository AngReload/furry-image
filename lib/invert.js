'use strict';

module.exports = function invert(image) {
    const filter = ([R, G, B, A]) => {
        return [255 - R, 255 - G, 255 - B, A];
    };

    return image.mapColor(filter);
};