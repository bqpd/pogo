/**
 * Callback used by requestAnimationFrame.
 *
 * Colors the canvas using the mask, then updates and draws Pogo.
 *
 * @param {object}		ctx		The context of the canvas on which to draw.
 * @param {Number[][]}	mask	Array of integers whose indeces correspond to locations on the canvas and values to colors.
 * @param {String[]}	color 	Array of colors indexed using global constants.
 * @param {object}		pogo 	The Pogo character object.
 */

function drawFrame(ctx, mask, color, pogo) {
	if (run) {
		window.requestAnimationFrame(function(ts) {
			//if (typeof imgData_debug === 'undefined') {
				colorCanvas(ctx, mask, color, pogo);
				drawPogo(ctx, pogo);

				drawFrame(ctx, mask, color, pogo);
			// } else {
			// 	ctx.putImageData(imgData_debug, 0, 0);
			// }
		});
	}
}
