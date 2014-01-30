
/*
 * GET home page.
 */

var alertDao = require('../lib/alertDao');

exports.index = function(req, res){
	alertDao.latestAlerts(10).then(function(alerts) {
		res.render('index', { title: 'FCO Alerts', alerts: alerts });
	}, function(err) {
		console.log("Error fetching latest alerts: " + err);
		res.render('index', { title: 'FCO Alerts', alerts: [] });
	});
};
