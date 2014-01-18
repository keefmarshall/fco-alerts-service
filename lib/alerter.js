/**
 * Push out alerts
 */

var gcm = require('node-gcm');

exports.triggerAlert = function(item)
{
	console.log("ALERT: " + item.title + ": " + item.description);
	
	// Push the message out:
	var message = new gcm.Message({
	    collapseKey: item.title,
	    delayWhileIdle: true,
	    timeToLive: 3,
	    data: {
	    	title: item.title,
	        description: item.description,
	        link: item.link
	    }
	});
	
	var sender = new gcm.Sender(process.env.GOOGLE_API_KEY);
	var registrationIds = [];

	// Demo ID for my android emulator - TODO: pull from MongoDB
	registrationIds.push("APA91bFCuqcyoVfqJnOrvMCZuvfBA7_vcj7wP8-MUfjyHzajYN5IHR2ccQfMN7H97KBQPm794mN8IsfdaEGzSg3ERIwF6Kvw-ZFaVYGPZdhpcU-DrBFRiv5elPMsec6e-bDAS1MxDQDkWUxDtP_lEpFQ1c8JESqSZunaV_Wj813amNUEtm5PjjI");

	sender.send(message, registrationIds, 4, function (err, result) {
		if (err)
		{
			console.log("Error pushing GCM message: " + err);
		}
	    console.log(result);
	});
};
