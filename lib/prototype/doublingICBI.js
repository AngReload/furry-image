function icbi(image, potentialForMinimized = 1, maxIters = 20, maxEdgeStep = 100, tEdgeContinuity = 50, stopCriterion = 1, changeLimit = 100, wAL = 1, wBT = -1, wGM = 5) {
	var enlargedImage = null; // out
	// assign default values
	wGM = wGM !== undefined ? wGM : 5.0;
	wBT = wBT !== undefined ? wBT : -1.0;
	wAL = wAL !== undefined ? wAL : 1.0;
	changeLimit = changeLimit !== undefined ? changeLimit : 100;
	stopCriterion = stopCriterion !== undefined ? stopCriterion : 1;
	tEdgeContinuity = tEdgeContinuity !== undefined ? tEdgeContinuity : 50;
	// =====================================================================
	// File name   : icbi.m
	// File Type   : m-file (script file for Matlab or Octave)
	// Begin       : 2007-10-01
	// Last Update : 2008-01-30
	// Author      : Andrea Giachetti, Nicola Asuni
	// Description : ICBI (Iteractive Curvature Based Interpolation)
	//               This function returns an enlarged image by a factor 2^N
	//               implements the enlargement methods FCBI and ICBI described in the 
	//               paper "Fast artifacts-free image interpolation", proceedings of BMVC 2008
	//               
	//
	// Copyright   : Andrea Giachetti, via 24 Maggio 17 38100 Trento, Italy
	//               Nicola Asuni, nicola.asuni@tecnick.com
	// License     : GNU GENERwAL PUBLIC LICENSE v.2
	//               http://www.gnu.org/copyleft/gpl.html
	// Version     : 1.1.000
	// =====================================================================    
	//
	// DESCRIPTION
	// --------------------
	// ICBI (Iteractive Curvature Based Interpolation)
	// This function returns an enlarged image by a factor 2^N implements
	// the enlargement methods FCBI and ICBI described in the paper
	// "Curvature-Driven Image Interpolation" submitted to SIGGRAPH 2008.
	//
	// KEYWORDS
	// --------------------
	// ICBI, image, zooming, magnification, upsizing, resampling,
	// resolution enhancement, interpolation,covariance-based adaptation,
	// geometric regularity, matlab, octave.
	
	// Some initial tests on the input arguments
	
	if (arguments.length < 1) {
		console.log('ICBI (Iteractive Curvature Based Interpolation) function.');
		console.log('This function returns an enlarged image.');
		console.log('image : Source image.');
		console.log('potentialForMinimized : Potential to be minimized (default = 1).');
		console.log('maxIters : Maximum number of iterations (default = 20).');
		console.log('maxEdgeStep : Maximum edge step (default = 100).');
		console.log('tEdgeContinuity : Edge continuity threshold (deafult = 50).');
		console.log('stopCriterion : Stopping criterion: 1 = change under threshold, 0 = maxIters iterations (default = 1).');
		console.log('changeLimit : Threshold on image change for stopping iterations (default = 100).');
		console.log('wAL : Weight for Curvature Continuity energy (default = 1.0).');
		console.log('wBT : Weight for Curvature enhancement energy (default = -1.0).');
		console.log('wGM : Weight for Isophote smoothing energy (default = 5.0).');
		enlargedImage = [];
		return;
	}
	
	
	// --------------------------------------------------------------------- 
	
	// check parameters
		
	CL = image.components.length;
		
	// ---------------------------------------------------------------------

	// bilinear interpolate
	const width = this.width * 2;
	const height = this.height * 2;
	const trivialDoubled = new this.constructor(this.width, height, this.components);
	this.forEach((value, c, w, h) => {
		const w2 = w * 2;
		const h2 = h * 2;
		trivialDoubled.set(c, w2 + 0, h2 + 0, value);
		trivialDoubled.set(c, w2 + 1, h2 + 0, value);
		trivialDoubled.set(c, w2 + 0, h2 + 1, value);
		trivialDoubled.set(c, w2 + 1, h2 + 1, value);
	});
	const bilinearDoubled = new this.constructor(width, height, this.constructor);
	trivialDoubled.forEach((v1, c, w, h) => {
		// const v1 = trivialDoubled.get(c, w + 0, h + 0);
		const v2 = trivialDoubled.get(c, w + 1, h + 0);
		const v3 = trivialDoubled.get(c, w + 0, h + 1);
		const v4 = trivialDoubled.get(c, w + 1, h + 1);
		const value = (v1 + v2 + v3 + v4) / 4;
		bilinearDoubled.set(c, w, h, value);
	});
	// fast curvature based interpolation
	const fastDoubled = new this.constructor(width, height, this.constructor);
	// s - stage
	for (let w = 2; w <= width; w += 2) {
		for (h = 2; h <= heigh; h++) {
			//        1     2      
			//                     
			//  4     5     6     7
			//          ()         
			//  8     9    10    11
			//                     
			//       13    14      
			const x = [
				[-3, -3], [-1, -3], [ 1, -3], [ 3, -3],
				[-3, -1], [-1, -1], [ 1, -1], [ 3, -1],
				[-3,  1], [-1,  1], [ 1,  1], [ 3,  1],
				[-3,  3], [-1,  3], [ 1,  3], [ 3,  3],
			].map(([x, y]) => trivialDoubled.get(c, w + x, h + y));

			const v1 = abs(x[ 5] - x[10]);
			const v2 = abs(x[ 6] - x[ 9]);

			const p1 = (x[ 5] + x[10]) / 2;
			const p2 = (x[ 6] + x[ 9]) / 2;

			if (v1 >= maxEdgeStep || v2 >= maxEdgeStep || abs(p1 - p2) >= maxEdgeStep) {
				// minVersus1  minVersus2
				// ▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒
				// ▒▒██▒▒██▒▒  ▒▒██▒▒██▒▒
				// ▒▒▒▒██▒▒▒▒  ▒▒▒▒██▒▒▒▒
				// ▒▒  ▒▒██▒▒  ▒▒██▒▒  ▒▒
				// ▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒
				if (v1 < v2) {
					imadeDoubled.set(c, w, h, p1);
				} else {
					imadeDoubled.set(c, w, h, p2);
				}
			} else {
				// pattern 1       pattern 2
				// ▒▒▒▒██▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒██▒▒▒▒
				// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒
				// ██▒▒  ▒▒██▒▒▒▒  ▒▒▒▒██▒▒  ▒▒██
				// ▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒▒
				// ▒▒▒▒██▒▒  ▒▒██  ██▒▒  ▒▒██▒▒▒▒
				// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒
				// ▒▒▒▒▒▒▒▒██▒▒▒▒  ▒▒▒▒██▒▒▒▒▒▒▒▒

				const pattern1 = abs((x[ 1] + x[ 4] + x[ 6] + x[ 9] + x[11] + x[14]) - (x[ 5] + x[10]) * 3);
				const pattern2 = abs((x[ 2] + x[ 8] + x[ 7] + x[13] + x[ 5] + x[10]) - (x[ 6] + x[ 9]) * 3);

				if (pattern1 > pattern2) {
					imadeDoubled.set(c, w, h, p1);
				} else {
					imadeDoubled.set(c, w, h, p2);
				}
			}
		}
	}
	// get image size
	[m,n] = [image.width, image.height];
	// calculate final image size;
	fm = m * 2;
	fn = n * 2;
	
	// initialize output image
	enlargedImage = new Image(fm, fn, CL);


	// CID for each image color (for each color layer)
		
		
		// convert image type to double to improve interpolation accuracy
		IMG = image.copy();

		// ZF the image is enlarged by scaling factor (2^1 - 1) at each cycle
			
			
			// get image size
			[m,n] = size(IMG);
			
			// size of the expanded image
			width2 = 2 * m;
			heigh2 = 2 * n;
			
			// initialize expanded image and support matrices with zeros
			imadeDoubled = zeros(width2,heigh2);
			D1 = zeros(width2,heigh2);
			D2 = zeros(width2,heigh2);
			D3 = zeros(width2,heigh2);
			C1 = zeros(width2,heigh2);
			C2 = zeros(width2,heigh2);
			
			// copy the low resolution grid on the high resolution grid
			
			imadeDoubled = IMG.bilinear(2, 2);
						
			// Calculate interpolated points in two steps.
			// s = 0 calculates on diagonal directions.
			// s = 1 calculates on vertical and horizondal directions.
			for (let s = 0; s <= 1; s++) {
				
				// ---------------------------------------------------------

				// FCBI (Fast Curvature Based Interpolation)
				// We compute second order derivatives in the opposite
				// directions and interpolate the two opposite neighbors in the
				// direction where the curvature is lower.
				for (let i = 2; i <= width2 - s; i += 2-s) {
					for (j = 2 + (s * (1 - i % 2)); j <= heigh2 - s; j++) {
						v1 = abs(imadeDoubled(i - 1, j - 1 + s) - imadeDoubled(i + 1, j + 1 - s));
						v2 = abs(imadeDoubled(i + 1 - s, j - 1) - imadeDoubled(i - 1 + s, j + 1));
						p1 = (imadeDoubled(i - 1, j - 1 + s) + imadeDoubled(i + 1, j + 1 - s)) / 2;
						p2 = (imadeDoubled(i+1-s,j-1)+imadeDoubled(i-1+s,j+1))/2;
						if( (v1 < maxEdgeStep) && (v2 < maxEdgeStep) && (i > 3-s) && (i < width2-3-s) && (j > 3-s) && (j < heigh2-3-s) && (abs(p1-p2) < maxEdgeStep) ) {
							if( abs(imadeDoubled(i-1-s,j-3+(2*s)) + imadeDoubled(i-3+s,j-1+(2*s)) + imadeDoubled(i+1+s,j+3-(2*s)) + imadeDoubled(i+3-s,j+1-(2*s)) + (2 * p2) - (6 * p1)) > abs(imadeDoubled(i-3+(2*s),j+1+s) + imadeDoubled(i-1+(2*s),j+3-s) + imadeDoubled(i+3-(2*s),j-1-s) + imadeDoubled(i+1-(2*s),j-3+s) + (2 * p1) - (6 * p2)) ) {
								imadeDoubled[i,j] = p1;
							} else {
								imadeDoubled[i,j] = p2;
							}
						} else {
							if( v1 < v2){
								imadeDoubled[i,j] = p1;
							} else {
								imadeDoubled[i,j] = p2;
							}               
						}
					}
				}
				
				step = 4.0 / (1 + s);
				
				
				// iterative refinement
				for (let g = 1; g <= maxIters; g++ ) {
					
					diff = 0;
					
					if (g < maxIters / 4) {
						step = 1;
					} else if (g < maxIters / 2) {
						step = 2;
					} else if (g < 3 * maxIters / 4) {
						step = 2;
					}


					// computation of derivatives
					for (let i = 4 - (2 * s); i <= width2 - 3 + s; i++) {
						for (let j = 4 - (2 * s) + ((1 - s) * mod(i,2)); j <= heigh2-3+s; j += 2-s) {
							C1[i,j] = (imadeDoubled(i-1+s,j-1) - imadeDoubled(i+1-s,j+1))/2;
							C2[i,j] = (imadeDoubled(i+1-(2*s),j-1+s) - imadeDoubled(i-1+(2*s),j+1-s))/2;
							D1[i,j] = imadeDoubled(i-1+s,j-1) + imadeDoubled(i+1-s,j+1) - 2*imadeDoubled(i,j);
							D2[i,j] = imadeDoubled(i+1,j-1+s) + imadeDoubled(i-1,j+1-s) - 2*imadeDoubled(i,j);
							D3[i,j] = (imadeDoubled(i-s,j-2+s) - imadeDoubled(i-2+s,j+s) + imadeDoubled(i+s,j+2-s) - imadeDoubled(i+2-s,j-s))/2;
						}
					}
										
					for (let i = 6-(3*s); i <= width2-5+(3*s); i += 2-s) {
						for (j = 6+(s*(mod(i,2)-3)); j <= heigh2-5+(3*s); j += 2) {
							
							c_1 = 1;
							c_2 = 1;
							c_3 = 1;
							c_4 = 1;
							
							if(abs(imadeDoubled(i+1-s,j+1) - imadeDoubled(i,j)) > tEdgeContinuity) {
								c_1 = 0;
							}
							if(abs(imadeDoubled(i-1+s,j-1) - imadeDoubled(i,j)) > tEdgeContinuity) {
								c_2 = 0;
							}
							if(abs(imadeDoubled(i+1,j-1+s) - imadeDoubled(i,j)) > tEdgeContinuity) {
								c_3 = 0;
							}
							if(abs(imadeDoubled(i-1,j+1-s) - imadeDoubled(i,j)) > tEdgeContinuity) {
								c_4 = 0;
							}
							
							EN1 = ( c_1*abs(D1(i,j)-D1(i+1-s,j+1)) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)));
							EN2 = ( c_3*abs(D1(i,j)-D1(i+1,j-1+s)) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)));
							EN3 = ( c_1*abs(D2(i,j)-D2(i+1-s,j+1)) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)));
							EN4 = ( c_3*abs(D2(i,j)-D2(i+1,j-1+s)) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)));
							EN5 = abs(imadeDoubled(i-2+(2*s),j-2) + imadeDoubled(i+2-(2*s),j+2) - 2*imadeDoubled(i,j));
							EN6 = abs(imadeDoubled(i+2,j-2+(2*s)) + imadeDoubled(i-2,j+2-(2*s)) - 2*imadeDoubled(i,j));

							EA1 = (c_1*abs(D1(i,j)-D1(i+1-s,j+1)- 3*step) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)-3*step));
							EA2 = (c_3*abs(D1(i,j)-D1(i+1,j-1+s)- 3*step) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)-3*step));
							EA3 = (c_1*abs(D2(i,j)-D2(i+1-s,j+1)- 3*step) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)-3*step));
							EA4 = (c_3*abs(D2(i,j)-D2(i+1,j-1+s)- 3*step) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)-3*step));
							EA5 = abs(imadeDoubled(i-2+(2*s),j-2) + imadeDoubled(i+2-(2*s),j+2) - 2*imadeDoubled(i,j) -2*step);
							EA6 = abs(imadeDoubled(i+2,j-2+(2*s)) + imadeDoubled(i-2,j+2-(2*s)) - 2*imadeDoubled(i,j) -2*step);
							
							ES1 = (c_1*abs(D1(i,j)-D1(i+1-s,j+1)+3*step) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)+3*step));
							ES2 = (c_3*abs(D1(i,j)-D1(i+1,j-1+s)+3*step) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)+3*step));
							ES3 = (c_1*abs(D2(i,j)-D2(i+1-s,j+1)+3*step) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)+3*step));
							ES4 = (c_3*abs(D2(i,j)-D2(i+1,j-1+s)+3*step) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)+3*step));
							ES5 = abs(imadeDoubled(i-2+(2*s),j-2) + imadeDoubled(i+2-(2*s),j+2) - 2*imadeDoubled(i,j) +2*step);
							ES6 = abs(imadeDoubled(i+2,j-2+(2*s)) + imadeDoubled(i-2,j+2-(2*s)) - 2*imadeDoubled(i,j) +2*step);
							
							EISO = (C1(i,j)*C1(i,j)*D2(i,j) -2*C1(i,j)*C2(i,j)*D3(i,j) + C2(i,j)*C2(i,j)*D1(i,j))/(C1(i,j)*C1(i,j)+C2(i,j)*C2(i,j));

							if(abs(EISO) < 0.2){
								EISO=0;
							}

							if(potentialForMinimized == 1) {
								EN = (wAL * (EN1 + EN2 + EN3 + EN4)) + (wBT * (EN5 + EN6));
								EA = (wAL * (EA1 + EA2 + EA3 + EA4)) + (wBT * (EA5 + EA6));
								ES = (wAL * (ES1 + ES2 + ES3 + ES4)) + (wBT * (ES5 + ES6));
							} else if(potentialForMinimized == 2) {
								EN = (wAL * (EN1 + EN2 + EN3 + EN4));
								EA = (wAL * (EA1 + EA2 + EA3 + EA4)) - (wGM * sign(EISO));
								ES = (wAL * (ES1 + ES2 + ES3 + ES4)) + (wGM * sign(EISO));
							} else {
								EN = (wAL * (EN1 + EN2 + EN3 + EN4)) + (wBT * (EN5 + EN6));
								EA = (wAL * (EA1 + EA2 + EA3 + EA4)) + (wBT * (EA5 + EA6)) - (wGM * sign(EISO));
								ES = (wAL * (ES1 + ES2 + ES3 + ES4)) + (wBT * (ES5 + ES6)) + (wGM * sign(EISO));
							}

							if((EN > EA) && (ES >EA)){
								imadeDoubled[i,j] = imadeDoubled(i,j) + step;
								diff = diff + step;
							}else if((EN > ES) && (EA >ES)) {
								imadeDoubled[i,j] = imadeDoubled(i,j) - step;
								diff = diff + step;
							}
						}
					}
					
					if((stopCriterion==1) && (diff < changeLimit))
						break;
					end
					
				} // end of iterative refinement
 
			} // end of (for s = 0:1)
			
			// assign th expanded image to the current image
			IMG = imadeDoubled;
			
		//} // end of (for ZF = 1:1)
		
		// store this color layer to the output image
		enlargedImage[CID] = round(IMG);

	//}
	
	// === EOF =================================================================
}