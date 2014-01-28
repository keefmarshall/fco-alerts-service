
/*
 * Device / user registration and preference management.
 */

var deviceUtils = require('../lib/deviceUtils');

exports.register = function(req, res)
{
	var regid = getRegidFromRequest(req, res);
	if (regid)
	{
		// check if it exists already, otherwise this will give an error!
		// If it does exist, just leave it as-is - the user probably updated
		// to a new version of the app which re-registered with the same ID.
		deviceUtils.findDevice(regid).then(
			function(found) {
				if (!found) 
				{
					deviceUtils.insertDevice({"_id": regid}).then(
						function(saved) {
							res.send(saved);
						}, 
						function(err) {
							res.status(500).send("An error occurred: " + err);
						}
					);
				}
				else
				{
					res.send(found);
				}
			},
			function(err) {
				res.status(500).send("Error registering device: " + err);
			}
		);
	}
};

exports.deregister = function(req, res)
{
	var regid = getRegidFromRequest(req, res);
	if (regid)
	{
		// Remove device regid from mongo:
		deviceUtils.deleteDevice(regid).then(
			function() {
				res.send("Item removed.");
			},
			function(err) {
				res.status(500).send("An error occurred, item not removed: " + err);
			}
		);
	}
};

exports.setCountries = function(req, res)
{
	var regid = getRegidFromRequest(req, res);
	if (regid)
	{
		var countriesJson = req.body.countries;
	
		var countries = JSON.parse(countriesJson);
		var device = {
			"_id": regid,
			"countries": countries
		};
		
		deviceUtils.updateDevice(device).then(
			function() {
				res.send("Updated.");
			},
			function(err) {
				res.status(500).send("An error occurred updating settings: " + err);
			}
		);
	}
};

exports.removeCountries = function(req, res) 
{
	var regid = getRegidFromRequest(req, res);
	if (regid)
	{
		// fetch the device, remove the countries property, 
		// then update with the changed device object:
		deviceUtils.findDevice(regid).then(
			function(device) {
				delete device.countries;
				deviceUtils.updateDevice(device).then(
					function() {
						res.send("Updated.");
					},
					function(err) {
						res.status(500).send(
							"An error occurred updating device with removed countries: " + err);
					}
				);
			},
			function(err) {
				res.status(500).send("An error occurred removing countries: " + err);
			}
		);
	}
};

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// INTERNAL FUNCTIONS

function getRegidFromRequest(req, res) 
{
	var regid = req.body.regid;
	
	if (!regid || regid.length === 0)
	{
		res.status(400).send("No registration ID!");
		return null;
	}
	else
	{
		return regid;
	}
}
