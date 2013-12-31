/**
 * New node file
 */

var db = require("../mongodb");

// Ensure DB is initialised at startup:
db.meta.find({"_id": "global_settings"}, function(err, settings) {
	if (!settings || settings.length == 0)
	{
		setLastUpdated(new Date("Fri, 20 Dec 2013 00:00:00 +0000"));
	}
});


function setLastUpdated(lastUpdated)
{
	db.meta.update(
		{"_id": "global_settings"},
		{
			"_id": "global_settings",
			"lastUpdated" : lastUpdated
		},
		{"upsert" : true}
	);
}


exports.lastUpdated = function(next)
{
	db.meta.findOne({"_id" : "global_settings"}, function(err, settings) {
		next(settings.lastUpdated);
	});
};

exports.setLastUpdated = setLastUpdated;
