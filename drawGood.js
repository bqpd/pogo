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
 * @param {number}		brushRadius 	The radius of the brush with which the user paints the mask.
 * @returns {Number[][]}	The updated mask.
 */

function drawGood(canvas, evt, mask, GOOD, BORDER, brushRadius) {
	var mousePos = getMousePos(canvas, evt);
	return labelGoodRegion(mask, mousePos.x, mousePos.y, brushRadius, GOOD, BORDER);
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function labelGoodRegion(mask, xc, yc, radius, GOOD, BORDER) {
	// Set square around cursor to be GOOD
	for (let x=xc-radius; x<xc+radius; x++) {
		for (let y=yc-radius; y<yc+radius; y++) {
			if (x>=0 && x<mask.length && y>=0 && y<mask[0].length) {
        if (pow(x-xc,2) + pow(y-yc,2) < pow(radius,2)) {
            mask[x][y] = GOOD;
        }
			}
		}
	}

	// Find and label new border of GOOD region.
	for (let x=0; x<mask.length; x++) {
		for (let y=0; y<mask[0].length; y++) {
			if (mask[x][y]==GOOD) {
				if (x==0 || x==mask.length-1 || y==0 || y==mask[0].length-1
					|| mask[x-1][y-1]==BAD || mask[x-1][y]==BAD || mask[x-1][y+1]==BAD
					|| mask[x][y-1]==BAD || mask[x][y+1]==BAD
					|| mask[x+1][y+1]==BAD || mask[x+1][y]==BAD || mask[x+1][y+1]==BAD) {
					 mask[x][y] = BORDER;
				}
			}
		}
	}

	return mask;
}
