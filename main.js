// Constants
BAD = 0;
GOOD = 1;
BORDER = 2;
FPS = 60;
DT = 1/FPS;
run = true

sqrt = Math.sqrt
pow = Math.pow
norm = (a, b) => sqrt(pow(a, 2) + pow(b, 2))
dist = (a, b) => sqrt(pow(a.x-b.x, 2) + pow(a.y-b.y, 2))

// User Input
color = [];
color[BAD] = hex2rgb('#4C453F');
color[GOOD] = hex2rgb('#B0A091');
color[BORDER] = hex2rgb('#F6E6D7');
brushRadius = 10;

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
	vx: 10,
	vy: 0,
	ax: 0,
	ay: 0,
	lasthitpixels: [],

	// Properties
	l0: 20,
	m: 1,
	k: 50,
	r: 8,
	headColor: '#F45947',
	stickColor: '#FDFAF0'
};

// Initialize Mask around Pogo
mask = labelGoodRegion(mask, pogo.x, pogo.y, pogo.r + Math.round(1.3*pogo.l0), GOOD, BORDER);
borderPixels = getBorderPixels(mask);

// Animate
window.onload = function() {
	window.requestAnimationFrame(function(ts) {
		drawFrame(canvas.getContext('2d'), mask, color, pogo);
	});
}

// Updates the mask when the mouse is moved when the mouse button is down.
function mouseMoveCallback(evt) {
	mask = drawGood(canvas, evt, mask, GOOD, BORDER, brushRadius);
	borderPixels = getBorderPixels(mask);
	console.log(borderPixels.length);
	console.log(borderPixels[0].x);
}
canvas.addEventListener('mousedown', function(ev) {
	canvas.addEventListener('mousemove', mouseMoveCallback);
});

// Stops updating the mask once the mouse button is up.
canvas.addEventListener('mouseup', function(evt) {
	canvas.removeEventListener('mousemove', mouseMoveCallback);
});
