/**
 * Isolated MongoDB setup
 * 
 * When needed, just do: 
 * 
 * var mongodb = require("./mongodb");
 */

var databaseURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "localhost:27017/fco-alerts";
var collections = ["alerts", "devices", "meta", "worldgeo", "retireddevices"];
var mongodb = require("mongojs").connect(databaseURI, collections);

mongodb.alerts.ensureIndex({'title': 1});
mongodb.devices.ensureIndex({'countries': 1});

module.exports = mongodb;

