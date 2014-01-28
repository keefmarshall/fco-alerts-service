/**
 * Push out alerts
 */

var gcm = require('node-gcm');
var db = require('../mongodb.js');
var devutils = require('./deviceUtils');

var sendNotification = function(devices, message) 
{
	var registrationIds = [];
	var sender = new gcm.Sender(process.env.GOOGLE_API_KEY);

	// TODO: can only send a max of 1000 registration IDs in a single msg.
	// This means that if the app does actually take off, this will have
	// to be a bit more clever. Unless the node-gcm lib already handles this -
	// must check.
	for (var i = 0; i < devices.length; i++)
	{
		registrationIds.push(devices[i]._id);
	}

	sender.send(message, registrationIds, 4, function (err, result) {
		if (err || !result)
		{
			console.log("Error pushing GCM message: " + err);
			return;
		}
		
		console.log(JSON.stringify(result, null, 2));

		// Now, we have to process the GCM response - there are two things we have to
		// look for
		// 1. A particular registration ID is invalid - likely because the user uninstalled, for
		//    example. We should delete the device.
		// 2. A registration ID has changed - not sure how this can happen, but if it does, we
		//    need to change our ID too.

		if (result.failure > 0 || result.canonical_ids > 0)
		{
			console.log("At least one error or change detected.. processing response...");

			// At least one ID failed or changed - we have to loop through in order.
			// Luckily the order is supposed to be the same as our registrationIds array
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
					devutils.deleteDevice(regid).then();
				}
				else if (res.message_id && res.canonical_id)
				{
					// need to switch the existing device's ID in the database:
					var newId = res.canonical_id;
					console.log("Canonical device ID change from " + regid + " to " + newId);
					devutils.changeDeviceId(regid, newId).then();
				}
			}
		}
	});
};

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
			sendNotification(devices, message);
		}
		else
		{
			// log error, not much else we can do
			console.log("An error occurred fetching devices: " + err);
		}
	});

};

