
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./src/routes');
var alertFeed = require('./src/routes/fco-alert-feed');
var alertData = require('./src/routes/fco-alert-data');
var test = require('./src/routes/test');
var user = require('./src/routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);
app.get('/refresh_alerts', alertFeed.refresh);

app.get('/regions', alertData.regionList);
app.get('/regions/:region', alertData.region);
app.get('/latest', alertData.latest);
app.get('/latest/bydevice/:regid', alertData.latestByDevice);
app.get('/latest/:region', alertData.region);

// REGISTRATION
app.post('/register', user.register);
app.post('/deregister', user.deregister);
app.post('/countries', user.setCountries);
app.post('/removeCountries', user.removeCountries);

// DEBUG/TEST:
//app.get('/fakealert', test.triggerAlert);
//app.get('/addtestdevice', test.addTestDevice);

// start cron job to update alerts:
// TODO: make this work sanely with multiple instances
console.log("Starting alert cronjob..");
var cronJob = require('cron').CronJob;
var job = new cronJob('0 */10 * * * *', alertFeed.updateAlerts);
job.start();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

