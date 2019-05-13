function listOfPointsEquals(l1, l2) {
	if (l1===null || l2===null) {
		return false;
	}
	if (l1.length!==l2.length) {
		return false;
	}
	return true;
}