function icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL, BT, GM) {
	var EI = null; // out
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
    // License     : GNU GENERAL PUBLIC LICENSE v.2
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
    //
    // USAGE
    // --------------------
    // [EI] = icbi(IM)
    // [EI] = icbi(IM, ZK)
    // [EI] = icbi(IM, ZK, SZ)
    // [EI] = icbi(IM, ZK, SZ, PF)
    // [EI] = icbi(IM, ZK, SZ, PF, VR)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL, BT)
    // [EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL, BT, GM)
    //
    //
    // INPUT
    // --------------------
    // IM : Source image.
    // ZK : Power of the zoom factor (default = 1)
    //      the image enlargement on vertical and horizontal direction is
    //      2^ZK; the final image size will be (SIZE * 2^ZK) - (2^ZK - 1).
    // SZ : Number of image bits per layer (default = 8).
    // PF : Potential to be minimized (default = 1).
    // VR : Verbose mode, if true prints some information during calculation
    //      (default = false).
    // ST : Maximum number of iterations (default = 20).
    // TM : Maximum edge step (default = 100).
    // TC : Edge continuity threshold (deafult = 50).
    // SC : Stopping criterion: 1 = change under threshold, 0 = ST iterations (default = 1).
    // TS : Threshold on image change for stopping iterations (default = 100).
    // AL : Weight for Curvature Continuity energy (default = 1.0).
    // BT : Weight for Curvature enhancement energy (default = -1.0).
    // GM : Weight for Isophote smoothing energy (default = 5.0).
    //
    //
    // OUTPUT
    // --------------------
    // EI : Enlarged image.
    //
    //
    // Examples
    // --------------------
    // Please check the icbiexample.m file on how to use this function.
    //
    //
    // Notes
    // --------------------
    // This implementation is not intended to be used in a production
    // environment. The main purpose of this script is to clearly show how
    // this technique works. Better performaces could be obtained using a
    // compiled version or rewriting this technique using a low-level
    // programming language.
    //
    //
    // ---------------------------------------------------------------------
    
    
    // Some initial tests on the input arguments
    
    if (arguments.length < 1) {
        console.log('ICBI (Iteractive Curvature Based Interpolation) function.');
        console.log('This function returns an enlarged image.');
        console.log('Usage:');
        console.log('[EI] = icbi(IM)');
        console.log('[EI] = icbi(IM, ZK)');
        console.log('[EI] = icbi(IM, ZK, SZ)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL, BT)');
        console.log('[EI] = icbi(IM, ZK, SZ, PF, VR, ST, TM, TC, SC, TS, AL, BT, GM)');
        console.log('Where:');
        console.log('IM : Source image.');
        console.log('ZK : Power of the zoom factor (default = 1); the image enlargement on vertical and horizontal direction is 2^ZK; the final image size will be (SIZE * 2^ZK) - (2^ZK - 1).');
        console.log('SZ : Number of image bits per layer (default = 8).');
        console.log('PF : Potential to be minimized (default = 1).');
        console.log('VR : Verbose mode, if true prints some information during calculation (default = false).');
        console.log('ST : Maximum number of iterations (default = 20).');
        console.log('TM : Maximum edge step (default = 100).');
        console.log('TC : Edge continuity threshold (deafult = 50).');
        console.log('SC : Stopping criterion: 1 = change under threshold, 0 = ST iterations (default = 1).');
        console.log('TS : Threshold on image change for stopping iterations (default = 100).');
        console.log('AL : Weight for Curvature Continuity energy (default = 1.0).');
        console.log('BT : Weight for Curvature enhancement energy (default = -1.0).');
        console.log('GM : Weight for Isophote smoothing energy (default = 5.0).');
        EI = [];
        return;
    }
    
    // assign default values
    GM = GM !== undefined ? GM : 5.0;
    BT = BT !== undefined ? BT : -1.0;
    AL = AL !== undefined ? AL : 1.0;
    TS = TS !== undefined ? TS : 100;
    SC = SC !== undefined ? SC : 1;
    TC = TC !== undefined ? TC : 50;
    TM = TM !== undefined ? TM : 100;
    ST = ST !== undefined ? ST : 20;
    VR = VR !== undefined ? VR : false;
    PF = PF !== undefined ? PF : 1;
    SZ = SZ !== undefined ? SZ : 8;
    ZK = ZK !== undefined ? ZK : 1;
    
    // --------------------------------------------------------------------- 
    
    // check parameters
    
    if (ZK < 1) {
        error('ZK must be a positive integer');
    } else {
        ZK = Math.floor(ZK);
    }

    SZ = Math.floor(SZ);
    
    CL = IM.components.length;
        
    // ---------------------------------------------------------------------
    
    // store time for verbose mode
    if (VR) {
        t1 = new Date();
    }
    
    // get image size
    [m,n] = [IM.width, IM.height];
    // calculate final image size;
    fm = (m * 2 ** ZK) - (2 ** ZK - 1);
    fn = (n * 2 ** ZK) - (2 ** ZK - 1);
    
    // initialize output image
    EI = new Image(fm, fn, CL);


    // for each image color (for each color layer)
    for (let CID = 1; CID <= CL; CID++) {
        
        if(VR) {
            fprintf('\n[//8.3f sec] LAYER: //02d\n', cputime-t1, CID);
        }
        
        // convert image type to double to improve interpolation accuracy
        IMG = IM.copy();

        // the image is enlarged by scaling factor (2^ZK - 1) at each cycle
        for (ZF = 1; ZF <= ZK; ZF++) {
            
            if(VR) {
                fprintf('[//8.3f sec]    ZF: //02d\n', cputime-t1, ZF);
            }
            
            // get image size
            [m,n] = size(IMG);
            
            // size of the expanded image
            mm = 2*m - 1; // rows
            nn = 2*n - 1; // columns
            
            // initialize expanded image and support matrices with zeros
            IMGEXP = zeros(mm,nn);
            D1 = zeros(mm,nn);
            D2 = zeros(mm,nn);
            D3 = zeros(mm,nn);
            C1 = zeros(mm,nn);
            C2 = zeros(mm,nn);
            
            // copy the low resolution grid on the high resolution grid
            
            IMGEXP = IMG.bilinear(2, 2);
                        
            // Calculate interpolated points in two steps.
            // s = 0 calculates on diagonal directions.
            // s = 1 calculates on vertical and horizondal directions.
            for (let s = 0; s <= 1; s++) {
                
                if(VR) {
                    fprintf('[//8.3f sec]        PHASE: //02d\n', cputime-t1, s);
                }
                
                // ---------------------------------------------------------

                // FCBI (Fast Curvature Based Interpolation)
                // We compute second order derivatives in the opposite
                // directions and interpolate the two opposite neighbors in the
                // direction where the curvature is lower.
                for (let i = 2; i <= mm - s; i += 2-s) {
                    for (j = 2 + (s * (1 - i % 2)); j <= nn - s; j++) {
                        v1 = abs(IMGEXP(i - 1, j - 1 + s) - IMGEXP(i + 1, j + 1 - s));
                        v2 = abs(IMGEXP(i + 1 - s, j - 1) - IMGEXP(i - 1 + s, j + 1));
                        p1 = (IMGEXP(i - 1, j - 1 + s) + IMGEXP(i + 1, j + 1 - s)) / 2;
                        p2 = (IMGEXP(i+1-s,j-1)+IMGEXP(i-1+s,j+1))/2;
                        if( (v1 < TM) && (v2 < TM) && (i > 3-s) && (i < mm-3-s) && (j > 3-s) && (j < nn-3-s) && (abs(p1-p2) < TM) ) {
                            if( abs(IMGEXP(i-1-s,j-3+(2*s)) + IMGEXP(i-3+s,j-1+(2*s)) + IMGEXP(i+1+s,j+3-(2*s)) + IMGEXP(i+3-s,j+1-(2*s)) + (2 * p2) - (6 * p1)) > abs(IMGEXP(i-3+(2*s),j+1+s) + IMGEXP(i-1+(2*s),j+3-s) + IMGEXP(i+3-(2*s),j-1-s) + IMGEXP(i+1-(2*s),j-3+s) + (2 * p1) - (6 * p2)) ) {
                                IMGEXP[i,j] = p1;                    
                            } else {
                                IMGEXP[i,j] = p2;                    
                            }
                        } else {
                            if( v1 < v2){
                                IMGEXP[i,j] = p1;                   
                            } else {
                                IMGEXP[i,j] = p2;                   
                            }               
                        }
                    }
                }
                
                step = 4.0 / (1 + s);
                
                
                // iterative refinement
                for (let g = 1; g <= ST; g++ ) {
                    
                    diff = 0;
                    
                    if (g < ST / 4) {
                        step = 1;
                    } else if (g < ST / 2) {
                        step = 2;
                    } else if (g < 3 * ST / 4) {
                        step = 2;
                    }


                    // computation of derivatives
                    for (let i = 4 - (2 * s); i <= mm - 3 + s; i++) {
                        for (let j = 4 - (2 * s) + ((1 - s) * mod(i,2)); j <= nn-3+s; j += 2-s) {
                            C1[i,j] = (IMGEXP(i-1+s,j-1) - IMGEXP(i+1-s,j+1))/2;
                            C2[i,j] = (IMGEXP(i+1-(2*s),j-1+s) - IMGEXP(i-1+(2*s),j+1-s))/2;
                            D1[i,j] = IMGEXP(i-1+s,j-1) + IMGEXP(i+1-s,j+1) - 2*IMGEXP(i,j);
                            D2[i,j] = IMGEXP(i+1,j-1+s) + IMGEXP(i-1,j+1-s) - 2*IMGEXP(i,j);
                            D3[i,j] = (IMGEXP(i-s,j-2+s) - IMGEXP(i-2+s,j+s) + IMGEXP(i+s,j+2-s) - IMGEXP(i+2-s,j-s))/2;
                        }
                    }
                                        
                    for (let i = 6-(3*s); i <= mm-5+(3*s); i += 2-s) {
                        for (j = 6+(s*(mod(i,2)-3)); j <= nn-5+(3*s); j += 2) {
                            
                            c_1 = 1;
                            c_2 = 1;
                            c_3 = 1;
                            c_4 = 1;
                            
                            if(abs(IMGEXP(i+1-s,j+1) - IMGEXP(i,j)) > TC) {
                                c_1 = 0;
                            }
                            if(abs(IMGEXP(i-1+s,j-1) - IMGEXP(i,j)) > TC) {
                                c_2 = 0;
                            }
                            if(abs(IMGEXP(i+1,j-1+s) - IMGEXP(i,j)) > TC) {
                                c_3 = 0;
                            }
                            if(abs(IMGEXP(i-1,j+1-s) - IMGEXP(i,j)) > TC) {
                                c_4 = 0;
                            }
                            
                            EN1 = ( c_1*abs(D1(i,j)-D1(i+1-s,j+1)) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)));
                            EN2 = ( c_3*abs(D1(i,j)-D1(i+1,j-1+s)) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)));
                            EN3 = ( c_1*abs(D2(i,j)-D2(i+1-s,j+1)) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)));
                            EN4 = ( c_3*abs(D2(i,j)-D2(i+1,j-1+s)) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)));
                            EN5 = abs(IMGEXP(i-2+(2*s),j-2) + IMGEXP(i+2-(2*s),j+2) - 2*IMGEXP(i,j));
                            EN6 = abs(IMGEXP(i+2,j-2+(2*s)) + IMGEXP(i-2,j+2-(2*s)) - 2*IMGEXP(i,j));

                            EA1 = (c_1*abs(D1(i,j)-D1(i+1-s,j+1)- 3*step) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)-3*step));
                            EA2 = (c_3*abs(D1(i,j)-D1(i+1,j-1+s)- 3*step) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)-3*step));
                            EA3 = (c_1*abs(D2(i,j)-D2(i+1-s,j+1)- 3*step) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)-3*step));
                            EA4 = (c_3*abs(D2(i,j)-D2(i+1,j-1+s)- 3*step) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)-3*step));
                            EA5 = abs(IMGEXP(i-2+(2*s),j-2) + IMGEXP(i+2-(2*s),j+2) - 2*IMGEXP(i,j) -2*step);
                            EA6 = abs(IMGEXP(i+2,j-2+(2*s)) + IMGEXP(i-2,j+2-(2*s)) - 2*IMGEXP(i,j) -2*step);
                            
                            ES1 = (c_1*abs(D1(i,j)-D1(i+1-s,j+1)+3*step) + c_2*abs(D1(i,j)-D1(i-1+s,j-1)+3*step));
                            ES2 = (c_3*abs(D1(i,j)-D1(i+1,j-1+s)+3*step) + c_4*abs(D1(i,j)-D1(i-1,j+1-s)+3*step));
                            ES3 = (c_1*abs(D2(i,j)-D2(i+1-s,j+1)+3*step) + c_2*abs(D2(i,j)-D2(i-1+s,j-1)+3*step));
                            ES4 = (c_3*abs(D2(i,j)-D2(i+1,j-1+s)+3*step) + c_4*abs(D2(i,j)-D2(i-1,j+1-s)+3*step));
                            ES5 = abs(IMGEXP(i-2+(2*s),j-2) + IMGEXP(i+2-(2*s),j+2) - 2*IMGEXP(i,j) +2*step);
                            ES6 = abs(IMGEXP(i+2,j-2+(2*s)) + IMGEXP(i-2,j+2-(2*s)) - 2*IMGEXP(i,j) +2*step);
                            
                            EISO = (C1(i,j)*C1(i,j)*D2(i,j) -2*C1(i,j)*C2(i,j)*D3(i,j) + C2(i,j)*C2(i,j)*D1(i,j))/(C1(i,j)*C1(i,j)+C2(i,j)*C2(i,j));

                            if(abs(EISO) < 0.2){
                                EISO=0;
                            }

                            if(PF == 1) {
                                EN = (AL * (EN1 + EN2 + EN3 + EN4)) + (BT * (EN5 + EN6));
                                EA = (AL * (EA1 + EA2 + EA3 + EA4)) + (BT * (EA5 + EA6));
                                ES = (AL * (ES1 + ES2 + ES3 + ES4)) + (BT * (ES5 + ES6));
                            } else if(PF == 2) {
                                EN = (AL * (EN1 + EN2 + EN3 + EN4));
                                EA = (AL * (EA1 + EA2 + EA3 + EA4)) - (GM * sign(EISO));
                                ES = (AL * (ES1 + ES2 + ES3 + ES4)) + (GM * sign(EISO));
                            } else {
                                EN = (AL * (EN1 + EN2 + EN3 + EN4)) + (BT * (EN5 + EN6));
                                EA = (AL * (EA1 + EA2 + EA3 + EA4)) + (BT * (EA5 + EA6)) - (GM * sign(EISO));
                                ES = (AL * (ES1 + ES2 + ES3 + ES4)) + (BT * (ES5 + ES6)) + (GM * sign(EISO));
                            }

                            if((EN > EA) && (ES >EA)){
                                IMGEXP[i,j] = IMGEXP(i,j) + step;
                                diff = diff + step;
                            }else if((EN > ES) && (EA >ES)) {
                                IMGEXP[i,j] = IMGEXP(i,j) - step;
                                diff = diff + step;
                            }
                        }
                    }
                    
                    if((SC==1) && (diff < TS))
                        break;
                    end
                    
                } // end of iterative refinement
 
            } // end of (for s = 0:1)
            
            // assign th expanded image to the current image
            IMG = IMGEXP;
            
        } // end of (for ZF = 1:ZK)
        
        // store this color layer to the output image
        EI[CID] = round(IMG);

    }
    
    if(VR)
        fprintf('[//8.3f sec] END\n', cputime-t1);
    end

    // === EOF =================================================================
}