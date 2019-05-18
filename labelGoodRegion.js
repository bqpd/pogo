/**
 * Updates the mask when the mouse is clicked.
 *
 * Gets the current position of the mouse and updates a circle of values in the mask around that point to indicate that the
 * region is "good" and traversible.
 *
 * @param {Number[][]}		mask			Array of integers whose indeces correspond to locations on the canvas and values to colors.
 * @param {number}			xc 				The x-coordinate of the center of the brush on the canvas.
 * @param {number}			yc 				The y-coordinate of the center of the brush on the canvas.
 * @param {number}			radius 			The radius of the brush with which the user paints the mask.
 * @param {number}			GOOD 			The index of the color array with the color of the "good" region.
 * @param {number}			BORDER 			The index of the color array with the color of the border between "good" and "bad" regions.
 * @param {number}			BAD 			The index of the color array with the color of the "bad" region.
 * @param {Object[]}		borderPixels	The array of pixels along the border.
 * @returns {Number[][]}	The updated mask.
 * @returns {Object[]}		The updated border pixel array.
 */
 
function labelGoodRegion(mask, xc, yc, radius, GOOD, BORDER, BAD, borderPixels) {
	var newGood = [];
	// Set square around cursor to be GOOD
	for (let x=xc-radius; x<xc+radius; x++) {
		for (let y=yc-radius; y<yc+radius; y++) {
			if (x>=0 && x<mask.length && y>=0 && y<mask[0].length) {
				if (pow(x-xc,2) + pow(y-yc,2) <= pow(radius,2)) {
					if (x==0 || x==mask.length-1 || y==0 || y==mask[0].length-1) {
						mask[x][y] = BORDER;
						borderPixels.push(new Point(x,y));
					} else {
						mask[x][y] = GOOD;
						thisPt = new Point(x,y);
						newGood.push(thisPt);
						var indexOfPt = indexOfPoint(borderPixels, thisPt);
						if (indexOfPt !== -1) {
							borderPixels.splice(indexOfPt, 1);
						}
					}
				}
			}
		}
	}

	// Find and label new border of GOOD region.
	for (let p=0; p<newGood.length; p++) {
		let x=newGood[p].x;
		let y=newGood[p].y;
		if (mask[x-1][y-1]==BAD || mask[x-1][y]==BAD || mask[x-1][y+1]==BAD ||
			mask[x][y-1]==BAD || mask[x][y+1]==BAD ||
			mask[x+1][y-1]==BAD || mask[x+1][y]==BAD || mask[x+1][y+1]==BAD) {
			mask[x][y] = BORDER;
			borderPixels.push(new Point(x,y));
		}
	}

	return [mask, borderPixels];
}
