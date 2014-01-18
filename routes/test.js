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
