function clearRoute(borderPixels) {
  for (let i=0; i<borderPixels.length; i++) {
    var pixel = borderPixels[i]
    pixel.cost = Infinity
    pixel.partOfAnOptimalPathTo = []
	}
}

function findRoute(goal, cumulative_cost=0) {
	for (let i=0; i<goal.canBeReachedFrom.length; i++) {
    let pixel = goal.canBeReachedFrom[i]
    let link_cost = 1  // NOTE: could also be a calculation of travel time, etc.
    let cost = cumulative_cost + link_cost
    if (pixel.cost < cost) {
      continue
    } else if (pixel.cost == cost) {
      for (let i=0; i<pixel.partOfAnOptimalPathTo.length; i++) {
        if (Object.is(goal, pixel.partOfAnOptimalPathTo[i]))
          return // we've already been here with this cost, no need to loop
      }
      pixel.partOfAnOptimalPathTo.push(goal)
    } else if (pixel.cost > cost) {
      pixel.cost = cost
      pixel.partOfAnOptimalPathTo = [goal]
    }
    findRoute(pixel, cost)
	}
}

function chooseRoute(start) {
  if (!start.partOfAnOptimalPathTo.length)
    return [start, []]
  var rand_idx = Math.floor(Math.random()*start.partOfAnOptimalPathTo.length)
  var next_waypoint = start.partOfAnOptimalPathTo[rand_idx]

  // if there's still a path to follow, keep going!
  var next_waypoints
  if ("partOfAnOptimalPathTo" in next_waypoint &&
      next_waypoint.partOfAnOptimalPathTo.length) {
    next_waypoints = chooseRoute(next_waypoint)
  } else {
    next_waypoints = [next_waypoint, []]
  }

  return [start, next_waypoints]
}

function drawRoute(route, pogo, ctx) {
  var [waypoint, next_waypoints] = route

  ctx.beginPath();
  ctx.fillStyle = "cyan";
  ctx.ellipse(waypoint.x,
              waypoint.y,
              pogo.r, pogo.r,
              0, 0, 2*Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "black";
  text = waypoint.cost != Infinity ? waypoint.cost : 0
  ctx.fillText(text, waypoint.x-3, waypoint.y+4)
  ctx.fill();

  // if it's not the goal yet, keep going!
  if (next_waypoints.length) {
    drawRoute(next_waypoints, pogo, ctx)
  }
}

// UNIT TESTS //
test = () => {
let pointA = {name:"A", canBeReachedFrom: []},
    pointB = {name:"B", canBeReachedFrom: [pointA]},
    pointC = {name:"C", canBeReachedFrom: [pointB, pointA]},
    pointF = {name:"F", canBeReachedFrom: [pointB]},
    pointD = {name:"D", canBeReachedFrom: [pointC, pointF]},
    pointE = {name:"E", canBeReachedFrom: [pointC]},
    goal = {name:"goal", canBeReachedFrom: [pointD, pointE]}


// add some cycles!
// NOTE: for chooseRoute to terminate 'goal' cannot be in any canBeReachedFroms
pointA.canBeReachedFrom = [pointB, pointC]
pointC.canBeReachedFrom = pointC.canBeReachedFrom.concat([pointD])

var points = [pointA, pointB, pointC, pointD, pointE, pointF, goal]

clearRoute(points)
findRoute(goal)

console.assert(pointA.partOfAnOptimalPathTo[0] == pointC)
console.assert(pointB.partOfAnOptimalPathTo[0] == pointC)
console.assert(pointB.partOfAnOptimalPathTo[1] == pointF)
console.assert(pointC.partOfAnOptimalPathTo[0] == pointD)
console.assert(pointC.partOfAnOptimalPathTo[1] == pointE)
console.assert(pointD.partOfAnOptimalPathTo[0] == goal)
console.assert(pointE.partOfAnOptimalPathTo[0] == goal)
console.assert(pointF.partOfAnOptimalPathTo[0] == pointD)
// console.log(points)

var viaD = false, viaE = false
for (let i=0; i<10; i++) {
  route = chooseRoute(pointA)
  console.assert(route[0] == pointA)
  console.assert(route[1][0] == pointC)
  if (route[1][1][0] == pointD)  viaD = true
  if (route[1][1][0] == pointE)  viaE = true
}
console.assert(viaD && viaE)  // chances of this failing are 2^-9, right?
}
test()
