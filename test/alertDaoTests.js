/**
 * 'vows' tests for ../lib/deviceDao.js
 * 
 * NB: requires a local MONGODB running - not strictly a unit test!
 */

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.should();
chai.use(chaiAsPromised);

var vows = require('vows');
var assert = require('chai').assert;
var expect = require('chai').expect;

// We want to use a test MONGODB:
process.env["MONGOTEST_URL"] = "localhost:27017/fco-alerts-testdb";

// class we're testing:
var alertDao = require('../src/lib/alertDao');

// Test fixture:
var alert1 = require("./fixtures/alert1");
var alert2 = require("./fixtures/alert2");

vows.describe('alerts').addBatch({
	
	"An alert with atom keys" : {
		topic: alertDao.cleanAtomKeys(alert1),
		'has no atom keys when cleaned' : function(topic) {
			var count = 0;
			Object.keys(topic).map(function(key) {
				if (key.lastIndexOf("atom:", 0) === 0) { 
					count++;
				}
			});
			assert.equal(0, count, 'cleaned alert has no atom keys');
		}
	}

}).addBatch({
	
	"A new alert" : {
		topic: function() {
			alertDao.upsertAlert(alert1).should.eventually.deep.equal(
					alertDao.cleanAtomKeys(alert1)).notify(this.callback);
		},
		'can be inserted' : function() {}
	}

}).addBatch({
	
	"clean up" : {
		topic: function() {
			var callback = this.callback;
			alertDao.deleteAlert(alert1._id).then(function() {
				alertDao.deleteAlert(alert2._id);
			}).then(callback).catch(callback);
		},
		"done": function(){}
	}
}).exportTo(module);
