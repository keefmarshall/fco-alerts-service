/**
 * Playing with RSVP to see make sure I know how it works
 */

var RSVP = require('rsvp');

// Checking that all() and allSettled() do parallel execution
// - which, I'm glad to report, they do :)
//
// Notes:
// allSettled() appears to never set 'rejected' state, it always
// fulfills after everything has completed but with a list of states 
// for each promise that you should check for failure.
//
// By contrast, all() only reports the first error state and it does this as
// soon as it occurs, so there is a very real danger that the remaining tasks 
// will still be in progress at this point. I recommend always using allSettled()
// for this reason as it will only fulfill once everything has finished.
// [otherwise if you call process.exit() in all().catch() then you'll cut off threads]

function buildPromises() 
{
	
	var promises = [1,2,3,4,5,6,7,8,9,10].map(function(i) {
		return new RSVP.Promise(function(resolve, reject) {
			setTimeout(function() {
					
				console.log(i);
				if (i === 8 || i === 3) {
					reject("Oh no, it's " + i + "!");
				} else {
					resolve(i);
				}
	
			}, Math.random() * 1000);
		});
	});

	return promises;
}

console.log("Trying with all()..");
RSVP.all(buildPromises()).then(function(thing) {
	console.log("Done: ", thing);
}).catch(function(err) {
	console.log("Error: ", err);
});

console.log("\n\n... and now with allSettled()... ");
RSVP.allSettled(buildPromises()).then(function(thing) {
	console.log("Done: ", thing);
}).catch(function(err) {
	console.log("Error: ", err);
});
