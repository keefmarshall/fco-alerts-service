/**
 * Methods for testing / debugging
 */

var alerter = require('../lib/alerter');
var db = require('../lib/mongodb');
var utils = require('../lib/utils');

exports.triggerAlert = function(req, res) {
	// Have we been given a message to send in the request?
	if (req.param('title') && req.param('description'))
	{
		var alert = {
				"guid" : new Date().getTime(),
				"title" : req.param('title'),
				"description": utils.stripHtml(req.param('description')),
				"link": (req.param('link') ? req.param('link') : "http://fcoalerts.herokuapp.com/")
		};
		sendTestAlert(alert, res);
	}
	else if (req.param("index")) // send the 'n'th alert, given index=n
	{
		var index = parseInt(req.param("index"));
		db.alerts.find().limit(index, function(err, alerts) {
			var alert = alerts[index - 1];
			alert.description = utils.stripHtml(alert.description);
			sendTestAlert(alert, res);
		});
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
	alerter.triggerAlert(alert).then(function() {
		res.send("Alert triggered for " + alert.title);
	});
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

