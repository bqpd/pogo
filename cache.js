var lastMessage = undefined;
var worker = new Worker('worker.js');

// Messages coming from main.js
onmessage = function(e) {
	if (lastMessage===undefined) {				// If this is the first message received from main.js
		worker.postMessage(e.data)				// then forward it to the worker.
		lastMessage = null;
	} else {									// Otherwise
		lastMessage = e.data;					// Save it for forwarding later.
	}
};

// Messages coming from worker.js
worker.onmessage = function(e) {
	if (e.data===null) {						// If the worker said you didn't give him anything anything
		worker.postMessage(lastMessage);		// Send worker the current instruction (maybe null).
	} else {									// Otherwise, if worker gave you a completed job
		postMessage(e.data);					// Forward to main.js
		worker.postMessage(lastMessage);		// Send worker current instruction (maybe null).
		lastMessage = null;						// Set current instruction to null.
	}
};