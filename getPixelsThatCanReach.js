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
	x1 = point.x;
	y1 = point.y;
	x2 = goal.x;
	y2 = goal.y;
	m = (y2-y1)/(x2-x1);
	function b(a) {return m-(x1+x2)*a;}
	function c(a) {return -x1*m+x1*x2*a;}
	
}