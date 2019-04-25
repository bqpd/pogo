/**
 * Converts hexadecimal color string to RGB array.
 *
 * Converts hexadecimal color string (e.g. '#FF0000') to Array of
 * corresponding decimal RGB values (e.g. [255,0,0]).
 *
 * @param {string}	hex 	The hexidecimal string representing the color. Can begin with '#'.
 * @returns {Number[]}	Array of R, G, and B values in decimal (0-255).
 */

function hex2rgb(hex) {
    var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var hex = new Array(3);
    for (let h=1; h<=hex.length; h++) {
    	hex[h-1] = parseInt(regex[h], 16);
    }
    return hex;
}