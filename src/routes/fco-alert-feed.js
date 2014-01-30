/**
 * New node file
 */

var RSVP = require('rsvp');
var FeedParser = require("feedparser");
var request = require('request');

var alerter = require('../lib/alerter');
var alertDao = require('../lib/alertDao');
var globals = require('../lib/globalsDao');
var utils = require('../lib/utils');


function updateAlertsFromFeed(feed)
{
	return new RSVP.Promise(function(resolve, reject) {
		globals.lastUpdated().then(function(lastUpdated) {
			console.log("Feed date: " + feed.meta.pubDate + ", lastupdated = " + lastUpdated);
			if (feed.meta.pubDate > lastUpdated)
			{
				console.log("Updating alerts in database..");
				var promises = [];
				for (var i = 0; i < feed.entries.length; i++)
				{
					var item = feed.entries[i];
					if (item.pubDate > lastUpdated)
					{
						promises.push(alertDao.upsertAlert(item).then(function() {
							item.description = utils.stripHtml(item.description);
							return alerter.triggerAlert(item);
						}));
					}
				}
				RSVP.allSettled(promises)
					.then(function(states) {
						// TODO: ignoring states for now, may need to log failures later
						console.log("Finished updating alerts in database.");
						return globals.setLastUpdated(feed.meta.pubDate);
					})
					.then(function() {
						resolve(feed);
					})
					.catch(reject);
			}
			else
			{
				console.log("Not updating, no changes detected");
				resolve(feed);
			}
		}).catch(function(err) {
			console.log("Error updating alerts from feed: ", err);
			reject(err);
		});
	});
}

function fetchAlerts()
{
	return new RSVP.Promise(function(resolve, reject) 
	{
		console.log("Fetching alerts..");
		var feed = { entries: [] };
		
		// NB, FCO site doesn't appear to support if-modified-since, so we have to fetch
		// the whole lot each time.
		request('https://www.gov.uk/foreign-travel-advice.atom')
			.on('error', reject) // errors on request
			.pipe(new FeedParser({addmeta: false}))
				.on('error', reject) // errors on pipe, I think we need both
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
					console.log("Finished fetching alerts");
					resolve(feed);
				});
	});

}

/**
 * Call this outside of a web environment - returns a promise
 */
exports.updateAlerts = function(onFinish)
{
	return new RSVP.Promise(function(resolve, reject) {
		fetchAlerts()
			.then(updateAlertsFromFeed)
			.then(resolve)
			.catch(reject);
	});
};


/**
 * Call this inside a web environment - ensures a response is always sent.
 */
exports.refresh = function(req, res)
{
	fetchAlerts()
		.then(updateAlertsFromFeed)
		.then(function(feed) {
			// for some reason, just passing res.send here doesn't work, we need to
			// create this anonymous function. Dunno why.
			console.log("placing feed on HTTP response..");
			res.send(feed);
		})
		.catch(function(err) {
			res.status(500).send(err);
		});
};
