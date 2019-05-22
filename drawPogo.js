/**
 * Draws the Pogo character on the canvas.
 *
 * Draws the head and stick of the Pogo character in the correct position and orientation on the canvas.
 *
 * @param {object}    ctx    The context of the canvas on which to draw.
 * @param {object}    pogo   The Pogo character object.
 */

contactpoint = {}

 function getPossibleCollisions(pogo, R, pixels) {
   var Dx = 0,
       Dy = 0,
       maybeCollisions = [];
   for (var i=0; i<pixels.length; i++) {
     border = pixels[i]
     d = dist(pogo, border)
     delta = R - d;
     if (delta > 0) {
       maybeCollisions.push(border)
       border.th = Math.atan2(-(pogo.x - border.x), -(pogo.y - border.y))  // to make down 0 angle
       Dx += delta*Math.sin(Math.PI+border.th) // component sum of deltas
       Dy += delta*Math.cos(Math.PI+border.th)
     }
   }

   return [maybeCollisions, Dx, Dy]
 }

 derpcontrol = false

 function getForces(pogo, maybeCollisions) {
   oldl = pogo.l
   // NOTE: the leg instantaneously adopts the correct length, creating energy
   pogo.l = pogo.l0  // reset length
   collisionAngleSpread = Math.atan(pogo.l0, pogo.r)/12
   for (let i=0; i<maybeCollisions.length; i++) {
     border = maybeCollisions[i]
     if (Math.abs(border.th-pogo.t) < collisionAngleSpread &&
         Math.abs(dist(pogo, border) - (pogo.r+pogo.l)) <= 9) {
       contactpoint = border
       pogo.l = Math.max(0, Math.min(pogo.l, dist(pogo, border) - pogo.r));
     }
   }

   // spring collision
   Fx = (pogo.l0-pogo.l)*pogo.k*Math.sin(Math.PI+pogo.t)
   Fy = (pogo.l0-pogo.l)*pogo.k*Math.cos(Math.PI+pogo.t)

   // head collision
   var [insideHead,
        Dx_head, Dy_head] = getPossibleCollisions(pogo, pogo.r, maybeCollisions)
   Fx += pogo.k_head*Dx_head
   Fy += pogo.k_head*Dy_head
   if (insideHead.length) {
     Fx -= pogo.vx*pogo.c_head  // generic linear drag to make it less bouncy
     Fy -= pogo.vy*pogo.c_head
   }

   if (insideHead.length) {
     contactpoint = {cost: Infinity}
     for (let i=0; i<insideHead.length; i++) {
        border = insideHead[i]
        if (border.partOfAnOptimalPathTo != undefined) {
          if (border.cost <= contactpoint.cost) {
            contactpoint = border
          }
        }
     }

     if (contactpoint.partOfAnOptimalPathTo != undefined) {
       chosenroute = chooseRoute(contactpoint)
       var nextpoint = chosenroute[1][0]
       var [vx_desired, vy_desired] = contactpoint.toReach[nextpoint.x][nextpoint.y]
       console.log(vx_desired, vy_desired)
       pogo.vx = vx_desired
       pogo.vy = vy_desired
       // Fx = (vx_desired - pogo.vx)/DT
       // Fy = (vy_desired - pogo.vy)/DT - GRAVITY
       // console.log(Fx, Fy)
       // run = false
       derpcontrol = true
     }
   }

   return [Fx, Fy]
 }

function drawPogo(ctx, pogo) {
  // time-step independent for constant accel (i.e. ballistic)
  pogo.x += pogo.vx*DT// + 0.5*pogo.ax*pow(DT, 2)
  pogo.y += pogo.vy*DT// + 0.5*pogo.ay*pow(DT, 2)

  var [maybeCollisions,
       Dx, Dy] = getPossibleCollisions(pogo, pogo.r + pogo.l0, borderPixels)

  // CONTROLLER //
  if (maybeCollisions.length) {
    if (pogo.t < -Math.PI)  pogo.t += 2*Math.PI
    if (pogo.t > Math.PI)   pogo.t -= 2*Math.PI
    delta_t = Math.atan2(-Dx, -Dy) - pogo.t
    if (delta_t < -Math.PI)  delta_t += 2*Math.PI
    if (delta_t > Math.PI)   delta_t -= 2*Math.PI
    // delta_t = Math.max(Math.min(delta_t, 1), -1) // velocity limit
    // NOTE: if velocity limit above imposed, system gains energy by rotating
    //       spring through the ground :(
    pogo.t += delta_t
  } else {  // align with ballistic trajectory
    pogo.t -= 0.1*(pogo.t - Math.atan2(pogo.vx, pogo.vy))
  }

  var [Fx, Fy] = getForces(pogo, maybeCollisions)

  new_ax = Fx/pogo.m
  new_ay = Fy/pogo.m + GRAVITY
  // trapezoidal integration of velocity
  if (!derpcontrol) {
    pogo.vx += new_ax*DT//(new_ax + pogo.ax)*DT/2
    pogo.vy += new_ay*DT//(new_ay + pogo.ay)*DT/2
    pogo.ax = new_ax
    pogo.ay = new_ay
  }
  derpcontrol = false

  v = norm(pogo.vx, pogo.vy)
  v_angle = Math.atan2(pogo.vx, pogo.vy)
  pogo.vl = v*Math.cos(pogo.t-v_angle)
  pogo.vt = -v*Math.sin(pogo.t-v_angle)
    ctx.beginPath();
    ctx.strokeStyle = "red"
    ctx.translate(pogo.x, pogo.y);
    ctx.lineTo(0, 0);
    ctx.lineTo(pogo.vx, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, pogo.vy);
    ctx.translate(-pogo.x, -pogo.y);
    ctx.stroke()
    ctx.beginPath();

  // RESTART POGO? //
  if (pogo.x < 0 || pogo.x > canvas.width ||
      pogo.y < 0 || pogo.y > canvas.height) {
    pogo.vx = pogo.vy = 0;
    pogo.vt = pogo.vl = 0;
    [pogo.x, pogo.y] = [pogo.restart_x, pogo.restart_y];
    contactpoint = {}
  }

  // DRAW POGO //
  // Leg
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

  // with some nice physics-based squish
  accel = pow(norm(pogo.ax, pogo.ay)/1e4, 0.5)
  squishfactor = 0.3*Math.min(accel, 1)
  ctx.ellipse(pogo.x,
              pogo.y + pogo.r*squishfactor,
              pogo.r*(1 + squishfactor),
              pogo.r*(1 - squishfactor),
              -Math.atan2(pogo.ax, pogo.ay),
              0, 2*Math.PI);
  ctx.fill();

  if (routeReady && contactpoint.partOfAnOptimalPathTo != undefined) {
    drawRoute(chosenroute, pogo, ctx)
  }
}
