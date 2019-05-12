function clearRoute(borderPixels) {
  for (let x=0; x<borderPixels.length; x++) {
    pixel = borderPixels[i]
    pixel.cost = Infinity
    pixel.partOfAnOptimalPathTo = []
	}
}

function findRoute(goal, cumulative_cost=0) {
	for (let x=0; x<goal.canBeReachedFrom; x++) {
    pixel = goal.canBeReachedFrom[i]
    if (pixel.cost <= cumulative_cost) {
      pixel.cost = cumulative_cost
      pixel.partOfAnOptimalPathTo.push(goal)
      link_cost = 1  // NOTE: could also be a calculation of travel time, etc.
      findRoute(pixel, cumulative_cost + link_cost)
    }
	}
}
