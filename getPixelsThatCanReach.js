function getPixelsThatCanReach(points, goal, mask, GOOD) {
	reachablePixels = [];
	for (let p=0; p<points.length; p++) {
		if (canPixelReach(points[p],goal,mask,GOOD)) {
			reachablePixels.push(points[p]);
		}
	}
	return reachablePixels;
}

function canPixelReach(point, goal, mask, GOOD) {
	// Parameterize Polynomial y = a*x^2 + b*x + c.
	// In this function, a, b, and c refer to the polynomial coefficients.
	var x1 = point.x;
	var y1 = point.y;
	var x2 = goal.x;
	var y2 = goal.y;
	if (x1>x2) {
		var xt = x1;
		var yt = y1;
		x1 = x2;
		x2 = xt;
		y1 = y2;
		y2 = yt;
	}
	var m = (y2-y1)/(x2-x1);
	function b(a) {return m-(x1+x2)*a;}
	function c(a) {return y1-x1*m+x1*x2*a;}
	
	// Test a's
	for (let a=0.01; a<1; a+=0.01) {
		function f(x) {return a*x*x+b(a)*x+c(a);}

		// Exclusion Criteria: projectile path intersects with wall
		var wontIntersectWall = true;
		for (let x=x1+1; x<x2; x++) {
			let y = Math.round(f(x));
			if (mask[x][y]!==GOOD) {
				wontIntersectWall = false;
				break;
			}
		}

		if (wontIntersectWall) {
			return true;
		}
	}
}