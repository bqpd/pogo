/**
 * Draws the base colors on the canvas.
 *
 * Uses the values in the mask to draw the background colors on the canvas by region.
 *
 * @param {object}		ctx		The context of the canvas on which to draw.
 * @param {Number[][]}	mask	Array of integers whose indeces correspond to locations on the canvas and values to colors.
 * @param {String[]}	color 	Array of colors indexed using global constants.
 */
 
function colorCanvas(ctx, mask, color) {
	var X = mask.length;
	var Y = mask[0].length;
	var imgData = ctx.getImageData(0,0,X,Y);
	for (let x=0; x<X; x++) {									// For each column
		for (let y=0; y<Y; y++) {								// For each row
			imgData = colorPixel(imgData, color[mask[x][y]], x, y, X, Y);
		}
	}

	ctx.putImageData(imgData, 0, 0);
}

function colorPixel(imgData, color, x, y, X, Y) {
	var baseInd = (y*X + x)*4;							// Calculate index in Image Data array
	for (let c=0; c<3; c++) {							// Fill in each pixel's R, G, and B values
		imgData.data[baseInd+c] = color[c];
	}
	imgData.data[baseInd+3] = 255;						// Set alpha
	return imgData;
}