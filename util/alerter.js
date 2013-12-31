/**
 * Push out alerts
 */

exports.triggerAlert = function(item)
{
	console.log("ALERT: " + item.title + ": " + item.description);
};
