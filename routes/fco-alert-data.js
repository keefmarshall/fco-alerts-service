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
		if (err || !alerts || alerts.length === 0)
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
};

exports.latestByDevice = function(req, res)
{
	// Find countries for this device, then find all alerts relating to that country
	var regid = req.params.regid;
	
	db.devices.findOne({"_id": regid}, function(err, device) {
		if (err || !device) {
			res.status(404).send("Device not found");
			return;
		}
		
		console.log("Got countries: " + JSON.stringify(device.countries));
		if (device.countries)
		{
			db.alerts.find({'title': {'$in' : device.countries}})
				.sort({'date': -1}).limit(10, function(err, alerts)
			{
				if (err || !alerts)
				{
					console.log("Error occurred fetching custom alerts: " + err);
					res.status(500).send({'Error': err});
				}
				else
				{
					res.send(alerts);
				}
			});
		}
		else // just get everything
		{
			console.log("No countries found, showing all");
			exports.latest(req, res);
		}
	});
};