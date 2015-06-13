require('coffee-script/register'); // registers the coffee-script compiler so coffeescript files can be included
var express = require('express');

var setupCommands = function(app) {
	var setupJS = require('./commands-js');
	var setupCS = require('./commands-cs');
	setupJS(app);
	setupCS(app);
};

var setupMiddleware = function(app) {
	var bodyParser = require('body-parser');
	app.use(express.static(__dirname + '/public'));
	app.use(bodyParser.urlencoded({extended: false}));
};

(function setupExpress() {
	var app = express();
	app.set('port', (process.env.PORT || 5000));

	setupMiddleware(app);
	setupCommands(app);

	app.listen(app.get('port'), function() {
		console.log('Node app is running on port', app.get('port'));
	});
})();

