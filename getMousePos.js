/**
 * The position of the cursor.
 *
 * Returns the x and y coordinates of the mouse cursor on the canvas at the time of an event as a Point.
 *
 * @param {object}		canvas			The canvas on which to draw.
 * @param {object}		evt				The event from which to get the mouse position.
 * @returns {object}	A point containing the x and y coordinates of the cursor on the canvas.
 */
 
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}