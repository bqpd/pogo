importScripts(
	'colorCanvas.js',
	'containsPoint.js',
	'drawFrame.js',
	'drawGood.js',
	'drawPogo.js',
	'findRoute.js',
	'getPixelsThatCanReach.js',
	'hex2rgb.js',
	'Point.js',
	'sleep.js'
)

onmessage = async function(e) {
	// If cache sent you an empty instruction, tell cache to give you something real.
	if (e.data===null) {
		await sleep(5000);
		self.postMessage(null);
	// Otherwise, if the instruction is real, 
	} else {
		// Unpack the message.
		var borderPixels, goal, mask, GOOD, BORDER, BAD, borderPixels, brushRadius;
		[borderPixels, goal, mask, GOOD, BORDER, BAD, borderPixels, brushRadius] = e.data;

		// Update the mask and border pixel list
		output = labelGoodRegion(mask, goal.x, goal.y, brushRadius, GOOD, BORDER, BAD, borderPixels);
		[mask, borderPixels] = output;

		// Update border pixels that can reach the goal.
		goal.canBeReachedFrom = getPixelsThatCanReach(borderPixels, goal, mask);
		// Do likewise for each of the border pixels.
		/*
		for (let p=0; p<borderPixels.length; p++) {
			borderPixels[p].canBeReachedFrom = getPixelsThatCanReach(borderPixels, borderPixels[p], mask);
		}
		*/

		// Return updated goal and border pixels.
		message = [mask, goal, borderPixels];
		postMessage(message);
		//close();
	}
};