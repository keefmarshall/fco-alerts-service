/**
 * New node file
 */

var db = require('../mongodb');
var FeedParser = require("feedparser");
var request = require('request');

function storeAlert(alert)
{
	alert._id = alert.guid;
	for (var key in alert)
	{
		if (key.lastIndexOf("atom") === 0)
		{
			delete alert[key];
		}
	}
	db.alerts.update({"_id": alert._id}, alert, {upsert: true});
}

function updateAlerts(onFinish, onError)
{
	console.log("Updating alerts..");
	var feed = { entries: [] };
	
	request('https://www.gov.uk/foreign-travel-advice.atom')
	.on('error', function(error) {
		onError(error);
	})
	.pipe(new FeedParser({addmeta: false}))
	.on('error', function(error) {
		if (onError) {onError(error);}
	})
	.on('meta', function (meta) {
		feed.meta = meta;
	})
	.on('readable', function () {
		var stream = this;
		var item = stream.read();
		while (item)
		{
			feed.entries.push(item);
			storeAlert(item);
			item = stream.read();
		}
	})
	.on('end', function() {
		if (onFinish) {onFinish(feed);}
		console.log("Finished updating alerts.");
	});

}

exports.get = function(req, res)
{
	updateAlerts(
			function(feed) {
				res.send(feed);
			},
			function(error) {
				res.status(500).send(error);
			});
};

exports.updateAlerts = updateAlerts;
