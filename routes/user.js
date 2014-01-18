
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
	
	// TODO: check if it exists already, otherwise this will give an error!
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
