/**
 * DAO for global settings in MongoDB
 */

var db = require("./mongodb");
var RSVP = require('rsvp');

// Ensure DB is initialised at startup:
db.meta.find({"_id": "global_settings"}, function(err, settings) {
	if (!settings || settings.length === 0)
	{
		exports.setLastUpdated(new Date("Fri, 20 Dec 2013 00:00:00 +0000"));
	}
});


exports.setLastUpdated = function(lastUpdated)
{
	return new RSVP.Promise(function(resolve, reject) {
		db.meta.update(
			{"_id": "global_settings"},
			{
				"_id": "global_settings",
				"lastUpdated" : lastUpdated
			},
			{"upsert" : true},
			function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			}
		);
	});
};


exports.lastUpdated = function()
{
	return new RSVP.Promise(function(resolve, reject) {
		db.meta.findOne({"_id" : "global_settings"}, function(err, settings) {
			if (err) {
				reject(err);
			} else {
				resolve(settings.lastUpdated);
			}
		});
	});
};
