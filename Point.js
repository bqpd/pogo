function Point(x,y) {
	this.x = x;
	this.y = y;
	this.canBeReachedFrom = [];
}

Point.prototype.addPointWithPathTo = function(point) {
	this.canBeReachedFrom.push(point);
}