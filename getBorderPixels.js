function getBorderPixels(mask) {
	borderPixels = [];
	for (let x=0; x<mask.length; x++) {
		for (let y=0; y<mask[0].length; y++) {
			if (mask[x][y]===BORDER) {
				borderPixels.push(Point(x,y));
			}
		}
	}
	return borderPixels;
}