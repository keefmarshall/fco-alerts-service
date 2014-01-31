/**
 * Top level entry point for scheduled feed task. This is a one-off script which
 * fetches the RSS feed, checks for changes and alerts if required, then exits.
 * 
 * It's designed to be used with Heroku's scheduler, or alternatively some form of
 * external cron job. It shouldn't be called from the server.
 */

var alertFeed = require('./src/routes/fco-alert-feed');

// This is a lot trickier than it looks, because most of the
// activities in here are asynchronous, but we need to ensure
// that the Node.js instance physically quits when done.
// 
// It's especially important when using the Heroku Scheduler, because I'll
// get charged money for the length of time this is running if it goes over the
// free hours.
//
// I've switched everything to use RSVP promises, so this should, in theory, always 
// return and exit nicely.
//
// Just in case, I've got a failsafe:
// Very crudely, time out after max of thirty seconds has passed, to minimise costs:
// [clearly this is dangerous, stuff might well still be running in the background]
setTimeout(function() {
	console.log("Exiting: ***** TIMED OUT *****");
	process.exit();
}, 30000);

console.log("Feedtask: starting update process...");

// Do the work:
alertFeed.updateAlerts()
	.then(function() {
		console.log("Done: exiting.");
		process.exit();
	})
	.catch(function(err) {
		console.log("Caught error: ", err);
		console.log("Exiting.");
		process.exit();
	});
