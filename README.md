# pogo
an underactuated game

![it's pronounced "geoff"](readme.gif)

## Defining the Environment
Our simulation opens on Pogo, a character on a pogo stick bouncing around a world you create. Click and drag through the screen to define an area through which Pogo can travel. When you release the mouse, that point will be defined as the goal to which Pogo must travel. Once Pogo has this goal, it performs trajectory optimization to determine the optimal path from it's current position to the goal. The path is displayed using green dots between cyan waypoints along the walls. Each waypoint is labelled with the number of remaining hops to the goal.

## Trajectory Optimization
On every `mouseup` event, the cursor's position is recorded as the goal position for Pogo to reach. Once the goal is determined, Pogo investigates every point along the border between the light and dark regions in the environment to determine from which border points Pogo can reach the goal in one hop. All one-hop points are stored in an array of reachable border points. For each of these newly reachable points, Pogo repeats the investigation with every remaining "unreached" point. Of these unreached points, those that can reach any of the points that can reach the goal are added to the reachable array. The process repeats until the array of reachable points stabilizes. All remaining points are considered unreachable. The complete algorithms is as follows:
```
1. Acquire goal point from mouseup event.
2. Clear all route information from tree.
3. Initialize cost (hops from goal) at zero.
4. Initialize array of last reached points with goal.
5. While the array of last reached points has nonzero length
	1. Increment cost by one.
	2. Initialize array of newly reached points with empty array.
	3. For each 
```