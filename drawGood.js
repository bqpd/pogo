/**
 * Updates the mask when the mouse is clicked.
 *
 * Gets the current position of the mouse and updates a square of values in the mask around that point to indicate that the
 * region is "good."
 *
 * @param {object}		canvas			The canvas on which to draw.
 * @param {object}		evt				The event from which to get the mouse position.
 * @param {Number[][]}	mask			Array of integers whose indeces correspond to locations on the canvas and values to colors.
 * @param {number}		GOOD 			The index of the color array with the color of the "good" region.
 * @param {number}		BORDER 			The index of the color array with the color of the border between "good" and "bad" regions.
 * @param {number}		BAD 			The index of the color array with the color of the "bad" region.
 * @param {Object[]}	borderPixels	The array of pixels along the border.
 * @param {number}		brushRadius 	The radius of the brush with which the user paints the mask.
 * @returns {Number[][]}	The updated mask.
 * @returns {Object[]}		The updated border pixel array.
 */

function drawGood(canvas, evt, mask, GOOD, BORDER, BAD, borderPixels, brushRadius) {
	var mousePos = getMousePos(canvas, evt);
	return labelGoodRegion(mask, mousePos.x, mousePos.y, brushRadius, GOOD, BORDER, BAD, borderPixels);
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

function labelGoodRegion(mask, xc, yc, radius, GOOD, BORDER, BAD, borderPixels) {
	var newGood = [];

	// Set square around cursor to be GOOD
	for (let x=xc-radius; x<xc+radius; x++) {
		for (let y=yc-radius; y<yc+radius; y++) {
			if (x>=0 && x<mask.length && y>=0 && y<mask[0].length) {
				if ((x-xc)*(x-xc) + (y-yc)*(y-yc) <= radius*radius) {
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
