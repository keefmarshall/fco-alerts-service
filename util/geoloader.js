/**
 * Load the world.geo.json file into MongoDB as an array of features - each 
 * feature as a separate Mongo object (rather than the whole collection as one Mongo
 * object) - the MongoDB docs are pretty light on info as to how the data should look
 * inside Mongo, and I can't find any good examples, so this is a bit of a stab in the
 * dark. 
 * 
 * NOTE you need MongoDB version 2.5.x or higher to support MultiPolygons, which hasn't
 * yet been released and certainly isn't supported via Heroku!! So, we have
 * to split out the multi ones into single polygons which is a right pain.
 */

var db = require('../mongodb');

var fs = require('fs');
var file = '../../world.geo.json/countries.geo.json';

fs.readFile(file, 'utf8', function (err, data) {
	if (err) {
		console.log('Error: ' + err);
		return;
	}
	 
	var features = JSON.parse(data).features;
	for (var i = 0; i < features.length; i++)
	{
		var feature = features[i];
		// Current Mongo 2.4.x release doesn't support MutiPolygon
		// [version 2.5 onwards should do]
		if (feature.geometry.type == "MultiPolygon")
		{
			// we need to split this out into separate Polygons:
			for (var p = 0; p < feature.geometry.coordinates.length; p++)
			{
				var newfeat = {};
				newfeat.id = feature.id + "-" + p;
				newfeat.type = "Feature";
				newfeat.properties = feature.properties;
				newfeat.geometry = {
						"type": "Polygon",
						"coordinates": feature.geometry.coordinates[p]
				};
				saveFeature(newfeat);
			}
		}
		else
		{
			saveFeature(feature);
		}
	}
	
	db.worldgeo.ensureIndex({"geometry": "2dsphere"});
});

function saveFeature(feature)
{
	feature._id = feature.id;
	// add to Mongo:
	db.worldgeo.update({"_id" : feature.id}, feature, {"upsert" : true});
}
