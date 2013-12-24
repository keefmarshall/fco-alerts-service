/**
 * New node file
 */

var db = require('../mongodb');
var FeedParser = require("feedparser");
var request = require('request');
var globals = require('../util/globals');
var alerter = require('../util/alerter');

function storeAlert(alert)
{
	alert._id = alert.guid;
	for (var key in alert)
	{
		// remove all the "atom:" keys - they're duplicates and they just use up space
		if (key.lastIndexOf("atom") === 0)
		{
			delete alert[key];
		}
	}
	db.alerts.update({"_id": alert._id}, alert, {upsert: true});
}

function updateAlertsFromFeed(feed)
{
	// hmm.. this is where async gets  annoying. I wonder if promises would make
	// for clearer code,
	globals.lastUpdated(function(lastUpdated) {
		if (feed.meta.pubDate > lastUpdated)
		{
			console.log("Updating alerts in database..");
			for (var i = 0; i < feed.entries.length; i++)
			{
				var item = feed.entries[i];
				if (item.pubDate > lastUpdated)
				{
					storeAlert(item);
					alerter.triggerAlert(item);
				}
			}
			console.log("Finished updating alerts in database.");
			globals.setLastUpdated(feed.meta.pubDate);
		}
		else
		{
			console.log("Not updating, no changes detected");
		}
	});
}

function fetchAlerts(onFinish, onError)
{
	console.log("Fetching alerts..");
	var feed = { entries: [] };
	
	// NB, FCO site doesn't appear to support if-modified-since, so we have to fetch
	// the whole lot each time.
	request('https://www.gov.uk/foreign-travel-advice.atom')
	.on('error', function(error) {
		if (onError) {onError(error);}
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
			item = stream.read();
		}
	})
	.on('end', function() {
		if (onFinish) {onFinish(feed);}
		console.log("Finished fetching alerts.");
	});

}

function updateAlerts()
{
	fetchAlerts(updateAlertsFromFeed, null);
}


exports.get = function(req, res)
{
	fetchAlerts(
			function(feed) {
				updateAlertsFromFeed(feed);
				res.send(feed);
			},
			function(error) {
				res.status(500).send(error);
			});
};

exports.updateAlerts = updateAlerts;
