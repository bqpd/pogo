/**
 * Determines whether an array contains a specific point.
 *
 * Returns true if an only if there exists a point in the input array with the same x and y values as the input point.
 *
 * @param {Object[]}	arr		The array of points to check.
 * @param {object}		point	The point for which to check.
 * @returns {boolean}	true iff an element of arr has the same x and y values as point.
 */

function containsPoint(arr, point) {
	return indexOfPoint(arr, point) !== -1;
}

/**
 * Determines the index of a point in an array.
 *
 * Returns the index of a point in an input array with x and y values that match an input point. If no such point can be
 * found, returns -1.
 *
 * @param {Object[]}	arr		The array of points to check.
 * @param {object}		point	The point for which to check.
 * @returns {number}	The index of the first matching element in arr with x and y values that match an input point, or
 *						-1 if no such element exists.
 */
 
function indexOfPoint(arr, point) {
	for (let i=0; i<arr.length; i++) {
		if (arr[i].x==point.x && arr[i].y==point.y) {
			return i;
		}
	}
	return -1;
}