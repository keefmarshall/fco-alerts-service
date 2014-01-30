/**
 * Data access methods for alerts - these all return a promise.
 */

var db = require('./mongodb');
var RSVP = require('rsvp');

exports.upsertAlert = function(alert)
{
	var promise = new RSVP.Promise(function(resolve, reject) {
		alert._id = alert.guid;
		alert = exports.cleanAtomKeys(alert);
		db.alerts.update({"_id": alert._id}, alert, {upsert: true}, function(err) {
			if (err) { 
				reject(err);
			} else {
				resolve(alert);
			}
		});
	});
	
	return promise;
};

exports.cleanAtomKeys = function(alert)
{
	// we want this to be clean, i.e. not affect the input:
	var clonedAlert = JSON.parse(JSON.stringify(alert));
	for (var key in clonedAlert)
	{
		// remove all the "atom:" keys - they're duplicates and they just use up space
		if (key.lastIndexOf("atom") === 0)
		{
			delete clonedAlert[key];
		}
	}

	return clonedAlert;
};

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
