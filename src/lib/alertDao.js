/**
 * Data access methods for alerts - these all return a promise.
 */

var db = require('./mongodb');
var RSVP = require('rsvp');

/** 
 * Fetch the latest 'n' alerts. Returns a promise.
 */
exports.latestAlerts = function(n)
{
	n = n ? n : 10;
	
	return new RSVP.Promise(function(resolve, reject) 
	{
		db.alerts.find().sort({"date": -1}).limit(n, function(err, alerts) {
			if (err) {
				reject(err);
			} else {
				resolve(alerts);
			}
		});
	});
};

/** 
 * Insert or update the supplied alert in the database. Returns a promise. 
 */
exports.upsertAlert = function(alert)
{
	return new RSVP.Promise(function(resolve, reject) {
		alert._id = alert.guid;
		alert = exports.cleanAtomKeys(alert);
		db.alerts.update({"_id": alert._id}, alert, {upsert: true}, function(err) {
			if (err) { 
				reject(err);
			} else {
				console.log("Upserting alert: ", alert.guid);
				resolve(alert);
			}
		});
	});
};

/** 
 * Remove keys starting with "atom:" from the alert. 
 * Synchronous method, does *not* return a promise.
 */
exports.cleanAtomKeys = function(alert)
{
	// we want this to be clean, i.e. not affect the input, so take a copy of the original:
	// actually, don't do this - turns out it messes with the date classes
	//var clonedAlert = JSON.parse(JSON.stringify(alert));
	for (var key in alert)
	{
		// remove all the "atom:" keys - they're duplicates and they just use up space
		if (key.lastIndexOf("atom") === 0)
		{
			delete alert[key];
		}
	}

	return alert;
};

/**
 * Delete an alert from the database. Returns a promise.
 */
exports.deleteAlert = function(alertId)
{
	return new RSVP.Promise(function(resolve, reject) {
		db.alerts.remove({'_id':alertId}, function(err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};
