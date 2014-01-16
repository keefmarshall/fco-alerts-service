/**
 * Methods for displaying / retrieving data from the alerts data in
 * our MongoDB
 *
 */

var db = require('../mongodb');

exports.regionList = function(req, res)
{
	db.alerts.distinct("title", function(err, regions) {
		res.send(regions);
	});
};

exports.region = function(req, res)
{
	var region = req.params.region;
	
	db.alerts.find({"title" : region}).sort({"date": -1}, function(err, alerts) {
		if (err || !alerts || alerts.length == 0)
		{
			res.send("Region '" + region + "' has no alerts");
		}
		else
		{
			res.send(alerts[0]);
		}
	});
};
