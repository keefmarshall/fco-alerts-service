
/*
 * GET users listing.
 */

var db = require('../mongodb');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.register = function(req, res)
{
	var regid = req.body.regid;
	
	if (!regid || regid.length == 0)
	{
		res.status(400).send("No registration ID!");
		return;
	}
	
	// check if it exists already, otherwise this will give an error!
	db.devices.find({'_id': regid}, function(err, list){
		if (list.length == 0) {
			db.devices.insert({"_id": regid}, function(err, saved) {
				if (err || !saved)
				{
					res.status(500).send("An error occurred: " + err);
				}
				else
				{
					res.send(saved);
				}
			});
		}
		else
		{
			res.send(list[0]);
		}
	})
};

exports.deregister = function(req, res)
{
	var regid = req.body.regid;
	
	if (!regid || regid.length == 0)
	{
		res.status(400).send("No registration ID!");
		return ;
	}
	
	// Remove device regid from mongo:
	db.devices.remove({"_id": regid}, function(err) {
		if (err)
		{
			res.status(500).send("An error occurred, item not removed: " + err);
		}
		else
		{
			res.send("Item removed.");
		}
	});
};

exports.setCountries = function(req, res)
{
	var regid = req.body.regid;
	var countriesJson = req.body.countries;
	
	if(!regid || regid.length == 0 || !countriesJson)
	{
		res.status(400).send("No regid, or missing countries field!");
		return;
	}
	
	var countries = JSON.parse(countriesJson);
	var device = {
			"_id": regid,
			"countries": countries
	};
	
	db.devices.update({"_id": regid}, device, {upsert: true}, function(err) {
		if(err)
		{
			res.status(500).send("An error occurred updating settings: " + err);
		}
		else
		{
			res.send("Updated.");
		}
	});
};

exports.removeCountries = function(req, res) {
	var regid = req.body.regid;
	
	if (!regid || regid.length == 0)
	{
		res.status(400).send("No registration ID!");
		return ;
	}
	
	// fetch the device, remove the countries property, update with the changed device object:
	db.devices.findOne({'_id': regid}, function(err, device) {
		if (err)
		{
			res.status(500).send("An error occurred removing countries: " + err);
			return;
		}
		
		delete device.countries;
		db.devices.update({"_id": regid}, device, function(err) {
			if(err)
			{
				res.status(500).send(
						"An error occurred updating device with removed countries: " + err);
			}
			else
			{
				res.send("Updated.");
			}
		});
		
	});
	
};
