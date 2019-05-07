/**
 * Draws the Pogo character on the canvas.
 *
 * Draws the head and stick of the Pogo character in the correct position and orientation on the canvas.
 *
 * @param {object}		ctx		The context of the canvas on which to draw.
 * @param {object}		pogo 	The Pogo character object.
 */

function drawPogo(ctx, pogo) {
  ctx.beginPath();

  // pogo dynamics
  pogo.l = pogo.l0
  // the central ball gets teleported out of walls with preserved energy (should never happen)
  var Fx = 0,
      Fy = 0,
      Fx_inner = 0,
      Fy_inner = 0,
      maxdelta = 0,
      R = pogo.r + pogo.l0,
      maybecollision = [];
  for (var i=0; i<borderPixels.length; i++) {
    border = borderPixels[i]
    d = dist(pogo, border)
    delta = R - d;
    if (delta > 0) {
      maybecollision.push(border)
      thwall = Math.atan2(pogo.x - border.x, -(pogo.y - border.y))  // to make down 0 angle
      border.th = thwall
      Fx += delta*pogo.k*Math.sin(Math.PI+thwall)
      Fy += delta*pogo.k*Math.cos(Math.PI+thwall)
      if (delta > pogo.l0) {
        Fx_inner += (delta-pogo.l0)*pogo.k_head*Math.sin(Math.PI+thwall)
        Fy_inner += (delta-pogo.l0)*pogo.k_head*Math.cos(Math.PI+thwall)
      }
    }
  }

  if (Fx_inner != 0 || Fy_inner != 0) {
    pogo.l = 0
    Fx = Fx_inner
    Fy = Fy_inner
    pogo.t = Math.atan2(Fx, -Fy)
    Fx = -Fx_inner
  } else {
    minangleSpread = Math.atan(pogo.l0, pogo.r)/6
    if (Fx != 0 || Fy != 0) {
      if (pogo.t < -Math.PI)  pogo.t += 2*Math.PI
      if (pogo.t > Math.PI)   pogo.t -= 2*Math.PI
      delta_t = Math.atan2(Fx, -Fy) - pogo.t
      if (delta_t < -Math.PI)  delta_t += 2*Math.PI
      if (delta_t > Math.PI)   delta_t -= 2*Math.PI
      delta_t = Math.max(Math.min(delta_t, 1), -1) // velocity limit
      // NOTE: if velocity limit is imposed, system gains energy by rotating
      //       spring through the ground :(
      pogo.t += delta_t
      for (var i=0; i<maybecollision.length; i++) {
        border = maybecollision[i]
        ctx.beginPath();
        border.th = Math.atan2(-(pogo.x - border.x), -(pogo.y - border.y))
        ctx.strokeStyle = "gray"
        delta = R - dist(pogo, border)
        if (Math.abs(border.th-pogo.t) < minangleSpread) {
          pogo.l = Math.min(pogo.l, pogo.l0 - delta);
          ctx.strokeStyle = "red"
        }
        ctx.moveTo(pogo.x, pogo.y);
        ctx.lineTo(border.x, border.y);
        // ctx.stroke();
      }
    } else {
      pogo.t -= 0.1*(pogo.t - Math.atan2(pogo.vx, pogo.vy))  // 1st-order counterclockwise return to upright
    }

    Fx = (pogo.l0-pogo.l)*pogo.k*Math.sin(Math.PI+pogo.t)
    Fy = (pogo.l0-pogo.l)*pogo.k*Math.cos(Math.PI+pogo.t)
  }

  pogo.ax = Fx/pogo.m
  pogo.ay = Fy/pogo.m + 98.1
  pogo.vx += pogo.ax*DT
  pogo.vy += pogo.ay*DT
  v = norm(pogo.vx, pogo.vy)
  pogo.x += pogo.vx*DT
  pogo.y += pogo.vy*DT

	// Leg : spacer*4 + segmentHeight*3 = pogo.l
  if (pogo.l > 0) {
    ctx.beginPath();
    nsegments = 3
  	spacer = segmentHeight = pogo.l/(2*nsegments - 1);
  	segmentWidth = pogo.r*(0.5 + 0.5*(1 - pogo.l/pogo.l0));
  	ctx.fillStyle = pogo.stickColor;
  	for (let s=0; s<nsegments; s++) {
  		// Transform CTX
  		ctx.translate(pogo.x, pogo.y);
  		ctx.rotate(-pogo.t);
  		ctx.translate(-pogo.x, -pogo.y);

  		// Draw segment of pogo stick
      if (s < nsegments-1) {
        ctx.fillRect(pogo.x - segmentWidth/2,
                     pogo.y + pogo.r + spacer*s + segmentHeight*s,
                     segmentWidth, segmentHeight);
      } else {
        ctx.ellipse(pogo.x,
                    pogo.y + pogo.r + spacer*(s+1) + segmentHeight*s - pogo.r_wheel/2,
                    pogo.r_wheel, pogo.r_wheel, 0, 0, 2*Math.PI);
        ctx.fill()
      }

  		// Undo Transform
  		ctx.translate(pogo.x, pogo.y);
  		ctx.rotate(pogo.t);
  		ctx.translate(-pogo.x, -pogo.y);
  	}
  }

	// Head
  ctx.beginPath();
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
