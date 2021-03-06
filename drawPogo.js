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

 function getForces(pogo, maybeCollisions) {
   // NOTE: the leg instantaneously adopts the correct length, creating energy
   pogo.l = pogo.l0  // reset length
   collisionAngleSpread = Math.atan(pogo.l0, pogo.r)/12
   for (let i=0; i<maybeCollisions.length; i++) {
     border = maybeCollisions[i]
     if (Math.abs(border.th-pogo.t) < collisionAngleSpread) {
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

   return [Fx, Fy]
 }

function drawPogo(ctx, pogo) {
  // time-step independent for constantcontactpoint = border accel (i.e. ballistic)
  pogo.x += pogo.vx*DT + 0.5*pogo.ax*pow(DT, 2)
  pogo.y += pogo.vy*DT + 0.5*pogo.ay*pow(DT, 2)


  if (dist(pogo, goal) <= pogo.r + pogo.r_wheel) {
    contactpoint = {cost: Infinity}
  }

  var [withinReach,
       _, _] = getPossibleCollisions(pogo, pogo.r + pogo.l0max, borderPixels)

  var [maybeCollisions,
       Dx, Dy] = getPossibleCollisions(pogo, pogo.r + pogo.l0min, withinReach)

  // DP CONTROLLER //
  var foundpush = false
  // if close but not too close, use this controller
  if (withinReach.length && !maybeCollisions.length) {
    var minangledist = Math.PI/24
    for (let i=0; i<withinReach.length; i++) {
      border = withinReach[i]
      if (border.partOfAnOptimalPathTo.length) {
        var nextpoint = border.partOfAnOptimalPathTo[0]
        if (border.toReach[nextpoint.x] != undefined) {
          var [vx_d, vy_d] = border.toReach[nextpoint.x][nextpoint.y]
          var Fx_d = (vx_d - pogo.vx)/DT
          var Fy_d = (vy_d - pogo.vy)/DT - GRAVITY
          var th_d = Math.atan2(Fx_d, Fy_d)
          angledelta = Math.PI + th_d - border.th
          if (angledelta < -Math.PI)  angledelta += 2*Math.PI
          if (angledelta > Math.PI)   angledelta -= 2*Math.PI
          if (Math.abs(angledelta) <= minangledist && border.cost <= contactpoint.cost) {
            foundpush = true
            contactpoint = border
            pogo.t = border.th
            collisionAngleSpread = Math.atan(pogo.l0, pogo.r)/12
            for (let i=0; i<withinReach.length; i++) {
              border = withinReach[i]
              if (Math.abs(border.th-pogo.t) < collisionAngleSpread) {
                pogo.l = Math.max(0, Math.min(pogo.l, dist(pogo, border) - pogo.r));
              }
            }
            var l0_d = norm(Fx_d, Fy_d)/pogo.k + pogo.l
            l0_d = Math.min(pogo.l0max, Math.max(pogo.l0min, l0_d))
            pogo.l0 += Math.max(-2, Math.min(l0_d-pogo.l0, 2))
          }
        }
      }
    }
  }

  if (!foundpush) {
    if (maybeCollisions.length) { // if too close, use this controller
        pogo.t = Math.atan2(-Dx, -Dy)
        pogo.l0 = pogo.l0min
        contactpoint = {cost: Infinity}
    } else {  // if far, use this controller
      pogo.t -= 0.1*(pogo.t - Math.atan2(pogo.vx, pogo.vy))
      pogo.l0 -= 0.1*(pogo.l0 - pogo.l0min)
    }
  }

  var [Fx, Fy] = getForces(pogo, withinReach)

  new_ax = Fx/pogo.m
  new_ay = Fy/pogo.m + GRAVITY
  // trapezoidal integration of velocity
  pogo.vx += (new_ax + pogo.ax)*DT/2
  pogo.vy += (new_ay + pogo.ay)*DT/2
  pogo.ax = new_ax
  pogo.ay = new_ay

  // RESTART POGO? //
  if (pogo.x < 0 || pogo.x > canvas.width ||
      pogo.y < 0 || pogo.y > canvas.height) {
    pogo.vx = pogo.vy = 0;
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
    chosenroute = chooseRoute(contactpoint)
    drawRoute(chosenroute, pogo, ctx)
  }
}
