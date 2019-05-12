function indexOfPoint(arr, point) {
	for (let i=0; i<arr.length; i++) {
		if (arr[i].x==point.x && arr[i].y==point.y) {
			return i;
		}
	}
	return -1;
}

function containsPoint(arr, point) {
	return indexOfPoint(arr, point) !== -1;
}