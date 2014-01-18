/** Parse the countries.html file downloaded from the fco site */

fs = require('fs')
fs.readFile('../data/countries.html', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  
  var pattern = /<a href="(.*)">(.*)<\/a>/g;
  var link = pattern.exec(data);
  console.log(link);
});
