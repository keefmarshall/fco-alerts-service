
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var alertFeed = require('./routes/fco-alert-feed');
var alertData = require('./routes/fco-alert-data');
var test = require('./routes/test');
var user = require('./routes/user');
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

// REGISTRATION
app.post('/register', user.register);
app.post('/deregister', user.deregister);

// DEBUG/TEST:
app.get('/fakealert', test.triggerAlert);

// start cron job to update alerts:
// TODO: make this work sanely with multiple instances
console.log("Starting alert cronjob..");
var cronJob = require('cron').CronJob;
var job = new cronJob('0 */10 * * * *', alertFeed.updateAlerts);
job.start();

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

