var lastMessage;
var busy = false;

self.addEventListener('message', function(e) {
	if (busy) {
		lastMessage = e;
	} else {
		busy = true;
		doWork(e);
		busy = false;
	}
});

var doWork = function(e) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", e.data);
	xhr.onload = function() {
		// e.data might be contained in xhr.responseText
		let goal = e.data[0];
		let borderPixels = e.data[1];
		let mask = e.data[2];

		goal.canBeReachedFrom = getPixelsThatCanReach(borderPixels, goal, mask);
		for (let p=0; p<borderPixels.length; p++) {
			borderPixels[p].canBeReachedFrom = getPixelsThatCanReach(borderPixels, borderPixels[p], mask);
		}

		self.postMessage([goal, borderPixels]);

		if(queue.length) {
			// run the next queued item
			runAjax(queue.shift());
		} else {
			busy = false;
		}
	}
};