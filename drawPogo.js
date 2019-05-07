/**
 * Draws the Pogo character on the canvas.
 *
 * Draws the head and stick of the Pogo character in the correct position and orientation on the canvas.
 *
 * @param {object}		ctx		The context of the canvas on which to draw.
 * @param {object}		pogo 	The Pogo character object.
 */

function drawPogo(ctx, pogo) {
  // pogo dynamics
  pogo.l = pogo.l0
  // the central ball gets teleported out of walls with preserved energy (should never happen)
  var Fx = 0,
      Fy = 0,
      maxdelta = 0,
      R = pogo.r + pogo.l0 + Math.round(pogo.r/2)/2;
  for (var i=0; i<borderPixels.length; i++) {
    border = borderPixels[i]
    delta = R - dist(pogo, border);
    if (delta > 0) {
      thwall = Math.atan2(pogo.x - border.x, -(pogo.y - border.y))  // to make down 0 angle
      Fx += delta*pogo.k*Math.sin(Math.PI+thwall)
      Fy += delta*pogo.k*Math.cos(Math.PI+thwall)
      pogo.l = Math.min(pogo.l, pogo.l0-delta)
    }
  }

  if (Fx != 0 || Fy != 0) {
    pogo.t = Math.atan2(Fx, -Fy)

  } else {
    pogo.t -= 0.1*pogo.t
  }

  pogo.ax = -Fx/pogo.m
  pogo.ay = Fy/pogo.m - -98.1
  pogo.vx += pogo.ax*DT
  pogo.vy += pogo.ay*DT
  v = norm(pogo.vx, pogo.vy)
  pogo.x += pogo.vx*DT
  pogo.y += pogo.vy*DT

	// Leg : spacer*4 + segmentHeight*3 = pogo.l
  ctx.beginPath();
  nsegments = 3
	spacer = segmentHeight = pogo.l/(2*nsegments - 1.48);
	segmentWidth = pogo.r*(0.5 + 0.5*(1 - pogo.l/pogo.l0));
	ctx.fillStyle = pogo.stickColor;
	for (let s=0; s<nsegments; s++) {
		// Transform CTX
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(-pogo.t);
		ctx.translate(-pogo.x, -pogo.y);

		// Draw segment of pogo stick
		ctx.fillRect(pogo.x - segmentWidth/2,
                 pogo.y + pogo.r + spacer*s + segmentHeight*s,
                 segmentWidth, segmentHeight);

		// Undo Transform
		ctx.translate(pogo.x, pogo.y);
		ctx.rotate(pogo.t);
		ctx.translate(-pogo.x, -pogo.y);
	}

	// Head
	ctx.fillStyle = pogo.headColor;

  squish = 0.3
  ctx.ellipse(pogo.x,
              pogo.y + squish*pogo.r*(1 - pogo.l/pogo.l0),
              pogo.r*(1 + squish - squish*pogo.l/pogo.l0),
              pogo.r*(1 - squish + squish*pogo.l/pogo.l0),
              -pogo.t,
              0, 2*Math.PI);
	ctx.fill();
}
