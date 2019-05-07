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

	// Head
	ctx.fillStyle = pogo.headColor;
	ctx.beginPath();

  // pogo dynamics
  pogo.ax = 0
  pogo.ay = -98.1
  pogo.vx += pogo.ax*DT
  pogo.vy += pogo.ay*DT
  v = norm(pogo.vx, pogo.vy)
  // the central ball gets teleported out of walls with preserved energy (should never happen)
  var avgborderx = 0,
      avgbordery = 0,
      nborders = 0
      // hit = [];
  for (var i=0; i<borderPixels.length; i++) {
    border = borderPixels[i]
    if (dist(pogo, border) < pogo.r) {
      // hit.push(i)
      nborders += 1

      avgborderx *= (nborders-1);
      avgborderx += border.x;
      avgborderx /= nborders;

      avgbordery *= (nborders-1);
      avgbordery += border.y;
      avgbordery /= nborders;
    }
  }
  if (nborders > 0) {
    // for (var i=0; i<hit.length; i++) {
    //   pogo.lasthitpixels.push(...borderPixels.splice(hit[i], 1));
    //   console.log(pogo.lasthitpixels)
    // }
    thwall = Math.atan2(pogo.x - avgborderx, -(pogo.y - avgbordery))  // to make down 0 angle
    thv_old = Math.atan2(pogo.vx, pogo.vy)
    thv_new = Math.PI + 2*thwall - thv_old
    pogo.vx = v*Math.sin(thv_new)
    pogo.vy = v*Math.cos(thv_new)
  } //else {
  //   borderPixels.push(...pogo.lasthitpixels);
  //   pogo.lasthitpixels = [];
  // }

  pogo.x += pogo.vx*DT
  pogo.y += pogo.vy*DT

	ctx.arc(pogo.x, pogo.y, pogo.r, 0, 2*Math.PI);
	ctx.fill();

	// Leg
	segmentHeight = Math.round(pogo.r/2);
	segmentWidth = pogo.r;
	spacer = Math.round(segmentHeight*pogo.l/pogo.l0);
	ctx.fillStyle = pogo.stickColor;
	for (let s=0; s<3; s++) {
		// Transform CTX
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(-pogo.t);
		ctx.translate(-pogo.x, -pogo.y);

		// Draw segment of pogo stick
		ctx.fillRect(pogo.x-Math.round(segmentWidth/2),pogo.y+pogo.r+spacer*(s+1)+segmentHeight*s, segmentWidth,segmentHeight);

		// Undo Transform
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(pogo.t);
		ctx.translate(-pogo.x, -pogo.y);
	}
}
