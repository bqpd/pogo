/**
 * Finds all the points capable of reaching a specified point.
 *
 * Iterates through all given points in an array and tests to see if each can
 * reach a specific point, then returns an array of those capable.
 *
 * @param {Object[]}  	points	Array of points to test.
 * @param {object}    	goal	Goal point to reach.
 * @param {Number[][]}  mask	Array of integers whose indeces correspond to locations on the canvas and values to colors.
 * @param {number}    	GOOD	The index of the color array with the color of the "good" region.
 * @param {number}    	cost 	?
 * @returns {Object[]}	Subarray of points that can reach goal.
 */

function getPixelsThatCanReach(points, goal, mask, GOOD, cost) {
	reachablePixels = [];										// Initialize returned array of points
	bpIndices = [];
	for (let p=0; p<points.length; p++) {						// For each point in given array of points
		if (points[p].cost > cost) {
			if (canPixelReach(points[p], goal, mask, GOOD)) {	// If that point can reach the goal in one hop.
				points[p].cost = cost;
				reachablePixels.push(points[p]);				// Add that point to the returned list.
				bpIndices.push(p);
			}
		}
	}
	return [reachablePixels,bpIndices];
}

function canPixelReach(point, goal, mask, GOOD) {
	// Compute maximum energy allowed in single hop
	var MAX_ENERGY = pogo.k*10*10
	var MAX_DY = MAX_ENERGY/pogo.m/GRAVITY

	// Parameterize Polynomial y = a*x^2 + b*x + c.
	// In this function, a, b, and c refer to the polynomial coefficients.
	var x1 = point.x;
	var y1 = point.y;
	var x2 = goal.x;
	var y2 = goal.y;
	// Ensure x1<x2
	if (x1>x2) {
		[x1,x2] = [x2,x1];
		[y1,y2] = [y2,y1];
	}
	// The x corresponding to the higher-energy waypoint.
	var xstar = x2;
	if (y1>y2) {
		xstar = x1;
	}
	var m = (y2-y1)/(x2-x1);						// Helper variable to make eqns easier
	var a_min = Math.max(m/(2*xstar-x1-x2), 0.01);	// Minimum a that accomplishes trajectory.

	// If point and goal are directly above/below each other
	if (x1==x2) {
		let x = x1;				// Since both x's are the same anyway
		if (y1>y2) {			// Ensure y1<y2
			[y1,y2] = [y2,y1];
		}

		// Exclusion Criterion: too much energy required.
		if (y2-y1>MAX_DY) {
			return false;
		}

		// Exclusion Criterion: projectile path intersect with wall
		for (let y=y1; y<=y2; y++) {								// For each point along path
			if (mask[x][y]!==GOOD) {								// If the point is not traversible
				if (!(mask[x][y]==BORDER && (y==y1 || y==y2))) {	// The point is allowed to be a border point iff it is the start/end of the path
					return false;									// If it's not traversible, return false.
				}
			}
		}

		return function(x) {return y1;};

	// If point needs parabolic arc
	} else {
		function b(a) {return m-(x1+x2)*a;}													// The quadratic coefficient on x^1
		function c(a) {return y1-x1*m+x1*x2*a;}												// The quadratic coefficient on x^0

		// Looking for valid a
		var a;
		for (a=a_min; a<7*a_min; a+=a_min/2+Math.log(a+1)*a_min/2) {								// The quadratic coefficient on x^2. Increase starting a to outlaw paths that are too shallow.
			function f(x) {return Math.round(a*x*x+b(a)*x+c(a));}							// y=ax^2+bx+x

			// Exclusion Criteria: projectile path intersects with wall
			var wontIntersectWall = true;
			var lastY = f(x1);																// The y value of the last x
			for (let x=x1; x<=x2; x++) {													// For all x from start point to endpoint
				var y = f(x);																// Compute corresponding y along ballistic trajectory

				let y1 = lastY;																// Rename and ensure y2>y1
				let y2 = y;																	// This is to make sure that, even if the slope of the trajectory is large here,
				if (y1>y2) {																// we will still check entire path for non-traversible regions.
					[y1,y2] = [y2,y1];
				}
				for (let y=y1; y<=y2; y++) {												// For each y from the last x to this one
					if (Math.abs(x-point.x)>1.5*pogo.r && Math.abs(y-point.y)>1.5*pogo.r
					 && Math.abs(x-goal.x)>1.5*pogo.r && Math.abs(y-goal.y)>1.5*pogo.r) {	// If I'm far from my start/end pt
						if (!hasClearance(x,y,mask,2*pogo.r,GOOD)) {
							wontIntersectWall = false;
							break;
						}
					} else {
						if (mask[x][y]!==GOOD) {											// If the point (x,y) is not traversible,
							if (!(mask[x][y]==BORDER && (manhattan(x,y,point.x,point.y)<7
							 || manhattan(x,y,goal.x,goal.y)<7))) {										// (the point is allowed to be a border if its one of the waypoints)
								wontIntersectWall = false;									// then the trajectory does intersect with a wall
								break;
							}
						}
					}
				}
				if (!wontIntersectWall) {break;}
				lastY = y;
			}

			// Exclusion Criteria: path requires too much energy
			var withinEnergyLimit = point.y-(c(a)-b(a)*b(a)/4/a)<=MAX_DY;
			if (!withinEnergyLimit) {return false;}

			// Must both not intersect with a border and remain within the provided energy limit in order to be a valid path
			if (wontIntersectWall && withinEnergyLimit) {
				if (point.toReach[goal.x] === undefined)  point.toReach[goal.x] = {}
				vx = Math.pow(GRAVITY/2/a, 0.5)
				if (point.x > goal.x)  vx = -vx
				vy = vx*b(a) + GRAVITY*point.x/vx
				point.toReach[goal.x][goal.y] = [vx, vy]
				return f;
			}
		}

		/*/ NICK HACK XXX
		console.log(`${point.x},${point.y}`)
		console.log(`${goal.x},${goal.y}`)
		console.log(`a_min = ${a_min}`)
		console.log(`a = ${a}`)
		console.log('~')

		var X = mask.length;
		var Y = mask[0].length;
		var imgData = ctx.getImageData(0,0,X,Y);

		var a = a_min;
		function f(x) {return Math.round(a*x*x+b(a)*x+c(a));}
		for (let x=x1; x<=x2; x++) {
			imgData = colorPixel(imgData, color[TEST], x, f(x), X, Y);
		}

		// START
			var wontIntersectWall = true;
			var lastY = f(x1);																// The y value of the last x
			for (let x=x1; x<=x2; x++) {													// For all x from start point to endpoint
				var y = f(x);																// Compute corresponding y along ballistic trajectory

				let y1 = lastY;																// Rename and ensure y2>y1
				let y2 = y;																	// This is to make sure that, even if the slope of the trajectory is large here,
				if (y1>y2) {																// we will still check entire path for non-traversible regions.
					[y1,y2] = [y2,y1];
				}
				for (let y=y1; y<=y2; y++) {												// For each y from the last x to this one
					if (Math.abs(x-point.x)>1.5*pogo.r && Math.abs(y-point.y)>1.5*pogo.r
					 && Math.abs(x-goal.x)>1.5*pogo.r && Math.abs(y-goal.y)>1.5*pogo.r) {	// If I'm far from my start/end pt
						if (!hasClearance(x,y,mask,2*pogo.r,GOOD)) {
							wontIntersectWall = false;
							console.log('alert 1')
							console.log(`${x},${y}`)
							break;
						}
					} else {
						if (mask[x][y]!==GOOD) {											// If the point (x,y) is not traversible,
							if (!(mask[x][y]==BORDER && (manhattan(x,y,point.x,point.y)<7
							 || manhattan(x,y,goal.x,goal.y)<7))) {									// (the point is allowed to be a border if its one of the waypoints)
								wontIntersectWall = false;
								console.log('alert 2')
								console.log(`${x},${y}`)							// then the trajectory does intersect with a wall
								break;
							}
						}
					}
				}
				if (!wontIntersectWall) {break;}
				lastY = y;
			}

			// Exclusion Criteria: path requires too much energy
			var withinEnergyLimit = point.y-(c(a)-b(a)*b(a)/4/a)<=MAX_DY;

			// Must both not intersect with a border and remain within the provided energy limit in order to be a valid path
			console.log(wontIntersectWall)
			console.log(withinEnergyLimit)
			if (wontIntersectWall && withinEnergyLimit) {
				return f;
			}
		// END

		ctx.putImageData(imgData, 0, 0);
		imgData_debug = imgData;

		run = false
		throw 'stop'
		// END NICK HACK */

		return false;
	}
}

function hasClearance(xc, yc, mask, radius, GOOD) {
	for (let x=xc-radius; x<xc+radius; x++) {
		for (let y=yc-radius; y<yc+radius; y++) {
			if (x<0 || x>=mask.length || y<0 || y>mask[0].length || mask[x][y]!==GOOD) {
				return false;
			}
		}
	}
	return true;
}

function manhattan(x1,y1,x2,y2) {
	return Math.abs(x1-x2)+Math.abs(y1-y2);
}
