/**
 * New node file
 */

var db = require('../lib/mongodb');
var FeedParser = require("feedparser");
var request = require('request');
var globals = require('../lib/globalsDao');
var alerter = require('../lib/alerter');
var utils = require('../lib/utils');

var alertDao = require('../lib/alertDao');

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
	globals.lastUpdated().then(function(lastUpdated) {
		console.log("Feed date: " + feed.meta.pubDate + ", lastupdated = " + lastUpdated);
		if (feed.meta.pubDate > lastUpdated)
		{
			console.log("Updating alerts in database..");
			for (var i = 0; i < feed.entries.length; i++)
			{
				var item = feed.entries[i];
				if (item.pubDate > lastUpdated)
				{
					storeAlert(item);
					item.description = utils.stripHtml(item.description);
					alerter.triggerAlert(item).then();
				}
			}
			console.log("Finished updating alerts in database.");
			globals.setLastUpdated(feed.meta.pubDate).then();
		}
		else
		{
			console.log("Not updating, no changes detected");
		}
	}).catch(function(err) {
		console.log("Error updating alerts from feed: " + err);
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


exports.refresh = function(req, res)
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
