function Point(x,y) {
	this.x = x;
	this.y = y;
	this.canBeReachedFrom = [];
	this.toReach = {}
}

Point.prototype.clone = function() {
	var newPt = new Point(this.x, this.y);
	newPt.canBeReachedFrom = this.canBeReachedFrom.slice();
	return newPt;
};

Point.prototype.manhattan = function(pt) {
	return Math.abs(this.x-pt.x) + Math.abs(this.y-pt.y);
}
