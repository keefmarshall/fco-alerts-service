/**
 * Methods for testing / debugging
 */

var alerter = require('../lib/alerter');
var db = require('../mongodb');
var utils = require('../lib/utils');

exports.triggerAlert = function(req, res) {
	// Have we been given a message to send in the request?
	if (req.query.title && req.query.description)
	{
		var alert = {
				"title" : req.body.title,
				"description": utils.stripHtml(req.body.description),
				"link": (req.query.link ? req.query.link : "http://fcoalerts.herokuapp.com/")
		};
		sendTestAlert(alert, res);
	}
	else
	{
		// pick an alert at random from Mongo and send it:
		db.alerts.findOne(function(err, alert) {
			alert.description = utils.stripHtml(alert.description);
			sendTestAlert(alert, res);
		});
	}
};

function sendTestAlert(alert, res)
{
	alert.title = "TEST: " + alert.title;
	alerter.triggerAlert(alert);
	res.send("Alert triggered for " + alert.title);
}

exports.addTestDevice = function(req, res)
{
	db.devices.insert({"_id":"APA91bFCuqcyoVfqJnOrvMCZuvfBA7_vcj7wP8-MUfjyHzajYN5IHR2ccQfMN7H97KBQPm794mN8IsfdaEGzSg3ERIwF6Kvw-ZFaVYGPZdhpcU-DrBFRiv5elPMsec6e-bDAS1MxDQDkWUxDtP_lEpFQ1c8JESqSZunaV_Wj813amNUEtm5PjjI"}, 
			function(err, newthing)
			{
				if (err) { res.status(500).send("Device not added! " + err);}
				else {res.send("Done");}
			}
	);
};

