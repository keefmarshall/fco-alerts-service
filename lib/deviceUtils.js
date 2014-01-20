/**
 * Utilities for handling device entries in the DB
 */

var db = require('../mongodb');

exports.deleteDevice = function(regid) 
{
	db.devices.findOne({"_id":regid}, function(err, device) {
		if (err || !device)
		{
			// shouldn't really happen, but.. nothing much we can do here
			console.log("deviceUtils: deleteDevice: error finding device: " + err);
			return;
		}
		
		// I'm paranoid, so I might just move the device entry into an archive
		// for now, just in case..
		db.retireddevices.insert(device);
		db.devices.remove({"_id": regid});
	});
};

exports.changeDeviceId = function(oldId, newId) 
{
	// need to switch the existing device's ID in the database:
	db.devices.findOne({"_id" : oldId}, function(err, device) {
		if (err || !device)
		{
			// shouldn't really happen, but.. nothing much we can do here
			console.log("deviceUtils: deleteDevice: error finding device: " + err);
			return;
		}

		// Change the ID, resave:
		device._id = newId;
		db.devices.insert(device, function(err, saved) {
			if (err || !saved)
			{
				console.log("Error changing canonical ID for device: " + err);
			}
			else
			{
				// remove the old entry:
				db.devices.remove({"_id": oldId});
			}
		});
	});
};
