'use strict';

const Image = require('./Image');
const {floor, ceil} = Math;

module.exports = function supersampling(img, xRes, yRes) {
    const xRatio = img.xRes / xRes;
    const yRatio = img.yRes / yRes;
    const zRes = img.zRes;
    const inv_xRatio = 1 / xRatio;
    const inv_yRatio = 1 / yRatio;

    const xResized = new Image(xRes, img.yRes, zRes, img.ac);
    for (let z = 0; z < zRes; z++) {
        for (let x = 0; x < xRes; x++) {
            const wS = x * xRatio;
            const wE = wS + xRatio;
            const wSC = ceil(wS);
            const wSF = floor(wS);
            const wEF = floor(wE);
            const wSfract = ((1 - wS % 1) % 1);
            const wEfract = (wE % 1);
            
            if (wSF === wEF) {
                for (let y = 0; y < img.yRes; y++) {
                    const v = img.get(wSF, y, z);
                    xResized.set(x, y, z, v);
                }
            } else {
                for (let y = 0; y < img.yRes; y++) {                  
                    let t = 0;
                    t += img.get(wSF, y, z) * wSfract;
                    for (let i = wSC; i < wEF; i++) t += img.get(i, y, z);
                    t += img.get(wEF, y, z) * wEfract;
                    const v = inv_xRatio * t;
                    xResized.set(x, y, z, v);
                }
            }
        }
    }

    const yResized = new Image(xRes, yRes, zRes, img.ac);
    for (let z = 0; z < zRes; z++) {
        for (let y = 0; y < yRes; y++) {
            const wS = y * yRatio;
            const wE = wS + yRatio;
            const wSF = floor(wS);
            const wEF = floor(wE);
            const wSfract = ((1 - wS % 1) % 1);
            const wEfract = (wE % 1);
                            
            if (wSF === wEF) {
                for (let x = 0; x < xRes; x++) {
                    const v = xResized.get(x, wSF, z);
                    yResized.set(x, y, z, v);                        
                }
            } else {
                for (let x = 0; x < xRes; x++) {
                    let t = 0;
                    t += xResized.get(x, wSF, z) * wSfract;
                    for (let i = ceil(wS); i < wEF; i++) t += xResized.get(x, i, z);
                    t += xResized.get(x, wEF, z) * wEfract;
                    const v = inv_yRatio * t;
                    yResized.set(x, y, z, v);                                                
                }
            }
        }
    }

    return yResized;
}