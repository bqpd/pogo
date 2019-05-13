// Constants
const BAD = 0;
const GOOD = 1;
const BORDER = 2;
const TEST = 3;
const FPS = 60;
const DT = 1/FPS;
run = true // set to false to halt animation

// Convenient Functions
sqrt = Math.sqrt
pow = Math.pow
norm = (a, b) => sqrt(pow(a, 2) + pow(b, 2))
dist = (a, b) => sqrt(pow(a.x-b.x, 2) + pow(a.y-b.y, 2))

// User Input
var color = [];
color[BAD] = hex2rgb('#4C453F');
color[GOOD] = hex2rgb('#B0A091');
color[BORDER] = hex2rgb('#F6E6D7');
color[TEST] = hex2rgb('#00FF00')
brushRadius = 40;

// Define Canvas
var ctx = canvas.getContext('2d');
canvas.width = Math.round(window.innerWidth*0.95);
canvas.height = Math.round(window.innerHeight*0.95);
var cw = canvas.width;
var ch = canvas.height;

// Initialize Canvas Mask
var mask_col = new Array(ch);
mask_col.fill(BAD);
var mask = new Array(cw);
for (let r=0; r<mask.length; r++) {
	mask[r] = mask_col.slice();
}

// Initialize Pogo
var pogo = {
	// States
	x: 0.5*cw,
	y: 50,
	l: 0,
	t: 0,
	tv: 10,
	vx: 10,
	vy: 0,
	ax: 0,
	ay: 0,
	lasthitpixels: [],

	// Properties
	l0: 20,
	m: 1,
	k: 300,
	c: 0.01,
	k_head: 500,
	c_head: 5,
	r: 8,
	r_wheel: 3,
	headColor: '#F45947',
	stickColor: '#FDFAF0'
};
pogo.restart_x = pogo.x;
pogo.restart_y = pogo.y;

// Initialize goal at Pogo's starting position
var goal = new Point(pogo.x, pogo.y);

// Initialize Mask around Pogo
var borderPixels = [];
[mask, borderPixels] = labelGoodRegion(mask, pogo.x, pogo.y, brushRadius, GOOD, BORDER, BAD, borderPixels);

// Animate
window.onload = function() {
	window.requestAnimationFrame(function(ts) {
		drawFrame(canvas.getContext('2d'), mask, color, pogo);
	});
}

// Updates the mask when the mouse is moved when the mouse button is down.
function mouseMoveCallback(evt) {
	[mask, borderPixels] = drawGood(canvas, evt, mask, GOOD, BORDER, BAD, borderPixels, brushRadius);
	goal = getMousePos(canvas, evt);

	/*/ NICK HACK XXX
	for (let x=0; x<mask.length; x++) {
		for (let y=0; y<mask[0].length; y++) {
			if (mask[x][y]==TEST) {
				mask[x][y]=BORDER;
			}
		}
	}
	// END NICK HACK */

	goal.canBeReachedFrom = getPixelsThatCanReach(borderPixels, goal, mask, GOOD);
	var reachablePixels = goal.canBeReachedFrom;
	var lastReachablePixels = [];
	while (lastReachablePixels.length!==reachablePixels.length) {
		// Clone reachablePixels into lastReachablePixels
		lastReachablePixels = [];
		for (let p=0; p<reachablePixels.length; p++) {
			lastReachablePixels.push(reachablePixels[p].clone());
		}

		var unreachedPoints = getDisjunctiveUnion(borderPixels, reachablePixels);
		// For each point that can reach the goal
		for (let p=0; p<reachablePixels.length; p++) {
			// Find points that can reach it
			var pointsThatCanReachIt = getPixelsThatCanReach(unreachedPoints, reachablePixels[p], mask, GOOD);

			// Update branch
			borderPixels[indexOfPoint(borderPixels,reachablePixels[p])].canBeReachedFrom = pointsThatCanReachIt;

			// Remove newly reached points from unreachedPoints
			for (let q=0; q<pointsThatCanReachIt.length; q++) {
				unreachedPoints.splice(indexOfPoint(unreachedPoints, pointsThatCanReachIt[q]), 1);
			}
		}

		reachablePixels = getDisjunctiveUnion(borderPixels, unreachedPoints);
	}

	/*/ NICK HACK XXX
	for (let i=0; i<reachablePixels.length; i++) {
		mask[reachablePixels[i].x][reachablePixels[i].y] = TEST;
	}
	colorCanvas(canvas.getContext('2d'), mask, color);
	// END NICK HACK */
}
canvas.addEventListener('mousedown', function(ev) {
	mouseMoveCallback(ev);
	canvas.addEventListener('mousemove', mouseMoveCallback);
});

// Stops updating the mask once the mouse button is up.
canvas.addEventListener('mouseup', function(evt) {
	canvas.removeEventListener('mousemove', mouseMoveCallback);
});
