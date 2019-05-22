function Point(x,y) {
	this.x = x;
	this.y = y;
	this.canBeReachedFrom = [];
	this.toReach = {}
	this.partOfAnOptimalPathTo = []
	this.cost = Infinity
}

Point.prototype.clone = function() {
	var newPt = new Point(this.x, this.y);
	newPt.canBeReachedFrom = this.canBeReachedFrom.slice();
	return newPt;
};

Point.prototype.manhattan = function(pt) {
	return Math.abs(this.x-pt.x) + Math.abs(this.y-pt.y);
}
