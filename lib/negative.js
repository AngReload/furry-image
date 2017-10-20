'use strict';

module.exports = function negative(image) {    
    const filter = ([R, G, B, A]) => {
        return [1 - R, 1 - G, 1 - B, A];
    };

    return image.mapColor(filter);
};