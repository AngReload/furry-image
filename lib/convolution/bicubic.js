'use strict';
const Image = require('../Image.js');

module.exports = function bicubic(image, xZoom, yZoom) {
    function getIntegral(a, b) {
        // 1/24 (23 + 36 x + 12 x^2)
        const fL = (x) => x * (23 + 18 * x + 4 * x * x) / 24;
        // 13/12 - x^2
        const fC = (x) => x * (13 - 4 * x * x) / 12;
        // 1/24 (23 - 36 x + 12 x^2)
        const fR = (x) => (2 * x - 1) * (4 * x * x - 16 * x + 15) / 48;
        const integralOf = (f, a, b) => f(b) - f(a);
        const clamp = (min, max, v) => Math.max(min, Math.min(max, v));
        const vL = integralOf(fL, clamp(-1.5, -0.5, a), clamp(-1.5, -0.5, b));
        const vC = integralOf(fC, clamp(-0.5, +0.5, a), clamp(-0.5, +0.5, b));
        const vR = integralOf(fR, clamp(+0.5, +1.5, a), clamp(+0.5, +1.5, b));
        return vL + vC + vR;
    }

    const xRatio = 1 / xZoom;
    const yRatio = 1 / yZoom;

    function getKernel(ratio) {
        const pad = ratio / 2;
        const center = getIntegral(-pad, pad);
        const right = [];
        for (let a = pad; a < 1.5; a += ratio) {
            right.push(getIntegral(a, a + ratio));
        }
        const origin = right.length;
        const left = right.slice().reverse();
        const matrix = left.concat(center, right);
        return { origin, matrix };
    }

    const xKernel = getKernel(xRatio);
    const yKernel = getKernel(yRatio);

    return image.map((v, x, y, z, img) => {
        let summ = 0;
        for (let i = 0; i < yKernel.matrix.length; i++) {
            summ += yKernel.matrix[i] * img.get(x, y + i - yKernel.origin, z);
        }
        return summ;
    }).map((v, x, y, z, img) => {
        let summ = 0;
        for (let i = 0; i < xKernel.matrix.length; i++) {
            summ += xKernel.matrix[i] * img.get(x + i - xKernel.origin, y, z);
        }
        return summ;
    });
}
