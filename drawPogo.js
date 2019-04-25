/**
 * Draws the Pogo character on the canvas.
 *
 * Draws the head and stick of the Pogo character in the correct position and orientation on the canvas.
 *
 * @param {object}		ctx		The context of the canvas on which to draw.
 * @param {object}		pogo 	The Pogo character object.
 */
 
function drawPogo(ctx, pogo) {
	ctx.fillStyle = pogo.color;
	r = 8;
	
	// Head
	ctx.fillStyle = pogo.headColor;
	ctx.beginPath();
	ctx.arc(pogo.x, pogo.y, r, 0, 2*Math.PI);
	ctx.fill();

	// Leg
	segmentHeight = Math.round(r/2);
	segmentWidth = r;
	spacer = Math.round(segmentHeight*pogo.l/pogo.l0);
	ctx.fillStyle = pogo.stickColor;
	console.log(pogo.stickColor)
	for (let s=0; s<3; s++) {
		// Transform CTX
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(-pogo.t);
		ctx.translate(-pogo.x, -pogo.y);

		// Draw segment of pogo stick
		ctx.fillRect(pogo.x-Math.round(segmentWidth/2),pogo.y+r+spacer*(s+1)+segmentHeight*s, segmentWidth,segmentHeight);

		// Undo Transform
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(pogo.t);
		ctx.translate(-pogo.x, -pogo.y);
	}
}