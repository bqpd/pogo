function getDisjunctiveUnion(borderPixels, reachedPoints) {
	var dUnion = [];
	for (let p=0; p<borderPixels.length; p++) {
		if (!containsPoint(reachedPoints, borderPixels[p])) {
			dUnion.push(borderPixels[p].clone());
		}
	}
	return dUnion;
}