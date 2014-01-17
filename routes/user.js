
/*
 * GET users listing.
 */

var db = require('../mongodb');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.register = function(req, res)
{
	var regid = req.params.regid;
	db.devices.insert({"_id": regid}, function(err, saved){
		res.send(saved);
	});
};
