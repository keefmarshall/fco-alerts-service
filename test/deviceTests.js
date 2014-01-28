/**
 * 'vows' tests for ../lib/deviceUtils.js
 * 
 * NB: requires a local MONGODB running - not strictly a unit test!
 * 
 * [I'm new to 'vows' and 'chai' - this might not be the best quality code(!), or even
 * the best option for testing..]
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
var deviceUtils = require('../lib/deviceUtils');

// Test fixture:
var device1 = { _id : 'devutils.test1', countries : ['France', 'Greece']};
var device2 = { _id : 'devutils.test2', countries : ['Argentina', 'Greece']};

vows.describe('devices').addBatch({
	
	"A new device" : {
		topic: function() {
			deviceUtils.insertDevice(device1).should.eventually.deep.equal(device1)
				.notify(this.callback);
		},
		'can be inserted' : function() {}
	}

}).addBatch({
	
	"An existing device" : {
		topic: function() {
			deviceUtils.findDevice(device1._id).should.eventually.deep.equal(device1)
				.notify(this.callback);
		},
		"can be found" : function() {}
	}
	
}).addBatch({
	
	"An existing device" : {
		topic: function() {
			var device = {
				_id : device1._id,
				countries: ['Angola', 'Barbados']
			};
			deviceUtils.updateDevice(device).should.be.fulfilled.and.notify(this.callback);
		},
		"can be updated" : function() {}
	}
	
}).addBatch({
	
	"An existing device" : {
		topic: function() {
			deviceUtils.deleteDevice(device1._id).should.be.fulfilled.and.notify(this.callback);
		},
		"can be deleted" : function() {}
	}
	
}).addBatch({
	
	"An existing device" : {
		topic: function() { 
			// the trick here is to also pass any rejected error to the callback
			deviceUtils.insertDevice(device2).then(
				deviceUtils.changeDeviceId(device2._id, "devutils.changed").
					should.be.fulfilled.and.notify(this.callback), this.callback);
		},
		"can have it's ID changed" : function() { }
	}

}).addBatch({
	
	"clean up" : {
		topic: function() {
			var callback = this.callback;
			deviceUtils.deleteDevice(device1._id).then(function() {
				deviceUtils.deleteDevice(device2._id).then(function() {
					deviceUtils.deleteDevice("devutils.changed").then(callback);
				}, callback);
			}, callback);
		},
		"done": function(){}
	}
}).exportTo(module);

