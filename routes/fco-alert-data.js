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
	
	db.alerts.find({"title" : region}).sort({"date": -1}).limit(10, function(err, alerts) {
		if (err || !alerts || alerts.length == 0)
		{
			res.send("Region '" + region + "' has no alerts");
		}
		else
		{
			res.send(alerts);
		}
	});
};

exports.latest = function(req, res)
{
	db.alerts.find().sort({"date": -1}).limit(10, function(err, alerts){
		if (err || !alerts)
		{
			res.status(500).send("An error occurred: " + err);
			return;
		}
		
		res.send(alerts);
	});
}