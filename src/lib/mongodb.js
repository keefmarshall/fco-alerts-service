/**
 * Isolated MongoDB setup
 * 
 * When needed, just do: 
 * 
 * var mongodb = require("./mongodb");
 */

var databaseURI = process.env.FCOALERTS_MONGO_URI ||
    process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||
	process.env.MONGOTEST_URL ||"localhost:27017/fco-alerts";
var collections = ["alerts", "devices", "meta", "worldgeo", "retireddevices"];

// Old version for mongojs v0.x
// var mongodb = require("mongojs").connect(databaseURI, collections);

// New version for mongojs 1.x and beyond
var mongojs = require("mongojs");
var mongodb = mongojs(databaseURI, collections, {authMechanism: 'SCRAM-SHA-1'});

mongodb.alerts.ensureIndex({'title': 1});
mongodb.devices.ensureIndex({'countries': 1});

module.exports = mongodb;

