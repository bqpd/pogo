function getPixelsThatCanReach(points, goal) {
	reachablePixels = [];
	for (let p=0; p<points.length; p++) {
		if (canPixelReach(points[p],goal)) {
			reachablePixels.push(points[p]);
		}
	}
	return reachablePixels;
}

function canPixelReach(point, goal) {
	
}