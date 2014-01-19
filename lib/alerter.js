/**
 * Push out alerts
 */

var gcm = require('node-gcm');
var db = require('../mongodb.js');

var sendNotification = function(devices, message) 
{
	var registrationIds = [];
	var sender = new gcm.Sender(process.env.GOOGLE_API_KEY);

	for (var i = 0; i < devices.length; i++)
	{
		registrationIds.push(devices[i]._id);
	}

	sender.send(message, registrationIds, 4, function (err, result) {
		if (err)
		{
			console.log("Error pushing GCM message: " + err);
		}
	    console.log(result);
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
			sendNotification(devices, message)
		}
		else
		{
			// log error, not much else we can do
			console.log("An error occurred fetching devices: " + err);
		}
	});

};

