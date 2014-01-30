/**
 * Push out alerts via Google Cloud Messaging
 */

var gcm = require('node-gcm');
var RSVP = require('rsvp');

var db = require('./mongodb.js');
var deviceDao = require('./deviceDao');

var sendNotification = function(devices, message) 
{
	return new RSVP.Promise(function(resolve, reject) {
		
		var registrationIds = [];
		var sender = new gcm.Sender(process.env.GOOGLE_API_KEY);
	
		// TODO: can only send a max of 1000 registration IDs in a single msg.
		// This means that if the app does actually take off, this will have
		// to be a bit more clever. The node-gcm lib doesn't handle this.
		for (var i = 0; i < devices.length; i++)
		{
			registrationIds.push(devices[i]._id);
		}
	
		sender.send(message, registrationIds, 4, function (err, result) {
			if (err || !result)
			{
				console.log("Error pushing GCM message: " + err);
				reject(err);
			}
			
			//console.log(JSON.stringify(result, null, 2));
			console.log("GCM response: ", {
					multicast_id: result.multicast_id,
					success: result.success,
					failure: result.failure,
					canonical_ids: result.canonical_ids,
					result_size: result.results.length
				});
	
	
			if (result.failure > 0 || result.canonical_ids > 0)
			{
				console.log("At least one error or change detected.. processing response...");
				handleGcmErrorResponse(result, registrationIds, resolve, reject);
			}
			else
			{
				resolve();
			}
		});
	});
};

/**
 * Now, we have to process the GCM response - there are two things we have to
 * look for
 * 1. A particular registration ID is invalid - likely because the user uninstalled, for
 *    example. We should delete the device.
 * 2. A registration ID has changed - not sure how this can happen, but if it does, we
 *    need to change our ID too.
 */
function handleGcmErrorResponse(result, registrationIds, resolve, reject)
{
	// At least one ID failed or changed - we have to loop through in order.
	// Luckily the order is supposed to be the same as our registrationIds array
	var promises = [];
	for (var i = 0; i < result.results.length; i++)
	{
		var res = result.results[i];
		var regid = registrationIds[i];
		
		// There's a whole ton of possible error conditions but these look like the
		// main ones to worry about in terms of removing devices:
		if (res.error && 
				(res.error == "NotRegistered" || res.error == "InvalidRegistration"))
		{
			// device probably uninstalled the app, so remove it from the DB
			console.log("detected invalid registration, removing device: " + regid);
			promises.push(deviceDao.deleteDevice(regid));
		}
		else if (res.message_id && res.canonical_id)
		{
			// need to switch the existing device's ID in the database:
			var newId = res.canonical_id;
			console.log("Canonical device ID change from " + regid + " to " + newId);
			promises.push(deviceDao.changeDeviceId(regid, newId));
		}
		else { 
			// nothing to do here.. 
		}
	}
	
	// we actually don't want to reject if this fails, because it might stop alert processing
	// and it's actually not the key part of the job here. So, we need to log failures but
	// carry on and mark this as resolved.
	RSVP.allSettled(promises).then(resolve).catch(function(err) {
		// this should never happen
		console.log("GCM response processing failed: ", err);
		resolve();
	});
}

exports.triggerAlert = function(item)
{
	console.log("ALERT: " + item.title + ": " + item.description);
	
	// Build the message:
	var message = new gcm.Message({
		collapseKey: item.title,
		delayWhileIdle: true,
		timeToLive: 60 * 60 * 24, // 1 day
		data: {
			guid: item.guid,
			title: item.title,
			description: item.description,
			link: item.link
        }
	});
	
	var country = item.title;
	if (/^TEST: /.test(country))
	{
		country = country.substring(6);
		console.log("Test message detected, using country code '" + country + "'.");
	}
	
	// We're looking for devices that either have not specified any countries, or have
	// got the country listed in their preferences:
	db.devices.find(
			{ $or : [{ 'countries' : {$exists: false}}, { 'countries' : country }]},
			function(err, devices) {
		if (!err)
		{
			sendNotification(devices, message).then();
		}
		else
		{
			// log error, not much else we can do
			console.log("An error occurred fetching devices: " + err);
		}
	});

};

