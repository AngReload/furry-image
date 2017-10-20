'use strict';

module.exports = function kernelBlurCircle(radius) {
    const radiusCeil = Math.ceil(radius);
    const sizeFull = radiusCeil + 1 + radiusCeil;

    const kernel = {
        "xOrigin": radiusCeil,
        "yOrigin": radiusCeil,
        "matrix": Array(sizeFull)
            .fill()
            .map(a => Array(sizeFull)),
        "divisor": 0
    };

    for(let y = -radiusCeil; y <= radiusCeil; y++) {
        for(let x = -radiusCeil; x <= radiusCeil; x++) {
            let v = 0;
            for (let radiusAA = radius; radiusAA < radius + 1; radiusAA += 1 / 8) {
                if (x * x + y * y <= radiusAA * radiusAA) {
                    v += 1;
                    ++kernel.divisor;
                }
            }
            kernel.matrix[y + radiusCeil][x + radiusCeil] = v;
        }
    }

    return kernel;
};
