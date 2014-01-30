/**
 * Utilities for handling device entries in the DB
 * 
 * These now all return promises, so usage is e.g.:
 * 
 *      var devutils = require('deviceUtils');
 *      devutils.insertDevice(device).then(success, error);
 * 
 */

var db = require('./mongodb');
var RSVP = require('rsvp');

exports.findDevice = function(regid)
{
	var promise = new RSVP.Promise(function(resolve, reject) {
		db.devices.findOne({'_id': regid}, function(err, device) {
			if (err)
			{
				reject(err);
			}
			else
			{
				resolve(device);
			}
		});
	});
	
	return promise;
};

exports.insertDevice = function(device)
{
	var promise = new RSVP.Promise(function(resolve, reject) 
	{
		db.devices.insert(device, function(err, saved) {
			if (err)
			{
				console.log("deviceUtils: error inserting device: " + JSON.stringify(err));
				reject(err);
			}
			else
			{
//				console.log("deviceUtils: insertDevice succeeded, returning saved: " + saved +
//						" in JSON: " + JSON.stringify(saved));
				resolve(saved[0]); // for some reason, 'saved' is a list here
			}
		});
	});
	
	return promise;
};

exports.updateDevice = function(device)
{
	var promise = new RSVP.Promise(function(resolve, reject) 
	{
		db.devices.update({"_id": device._id}, device, {upsert: true}, function(err) {
			if(err)
			{
				reject(err);
			}
			else
			{
				resolve(device);
			}
		});
	});

	return promise;
};

exports.deleteDevice = function(regid) 
{
	var promise = new RSVP.Promise(function(resolve, reject) 
	{
		db.devices.findOne({"_id":regid}, function(err, device) {
			if (err)
			{
				// shouldn't really happen, but.. nothing much we can do here
				console.log("deviceUtils: deleteDevice: error finding device: " + err);
				reject(err);
			}
			else if(device)
			{
				// I'm paranoid, so I might just move the device entry into an archive
				// for now, just in case..
				db.retireddevices.insert(device, function() {
					// NB we don't care if retireddevices insert fails, likely 
					// there was already one in place
					db.devices.remove({"_id": regid}, function() {
						resolve();
					});
				});
			}
			else
			{
				// nothing to remove
				resolve();
			}
		});		
	});
	
	return promise;
};

exports.changeDeviceId = function(oldId, newId) 
{
	var promise = new RSVP.Promise(function(resolve, reject) 
	{
		// need to switch the existing device's ID in the database:
		db.devices.findOne({"_id" : oldId}, function(err, device) 
		{
			if (err || !device)
			{
				// shouldn't really happen, but.. nothing much we can do here
				console.log("deviceUtils: deleteDevice: error finding device: " + err);
				reject(err);
			}
			else
			{
				// Change the ID, resave:
				device._id = newId;
				db.devices.insert(device, function(err, saved) {
					if (err || !saved)
					{
						console.log("Error changing canonical ID for device: " + err);
						reject(err);
					}
					else
					{
						// remove the old entry:
						db.devices.remove({"_id": oldId}, function() {
							resolve();
						});
					}
				});
			}
		});
	});
	
	return promise;
};
