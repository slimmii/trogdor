Slack = require('node-slackr');
var slack = new Slack('https://hooks.slack.com/services/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', {
	channel: "#neejberhood",
	username: "trogdor",
	icon_url: "http://i.stack.imgur.com/ihN3m.png"
})
var express = require('express');
var bodyParser = require('body-parser');
var htmlToText = require('html-to-text');
var requestLib = require('request');
var cheerio = require('cheerio');
var app = express();

var urlencodedParser = bodyParser.urlencoded({
	extended: false
})

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.post('/wikiwiki', urlencodedParser, function(req, res) {
	
	//slack.notify(messages);
	requestLib.get('http://wikiwiki.winak.be/index.php/' + req.body.text, function(error, response, body) {
		if (!error && response.statusCode == 200) {
		    $ = cheerio.load(body);
			var text = htmlToText.fromString($('#bodyContent').html(), {
			});
			console.log(text);
			//slack.notify(text);
			
			var html = text.replace(
    // Replace out the new line character.
    new RegExp( "\\n--------------------------------------------------------------------------------\\n", "g" ), 
    
    // Put in ... so we can see a visual representation of where
    // the new line characters were replaced out.
    "" 
    );
			
			messages = {
				text: "WINAK WikiWiki",
				channel: "#neejberhood",
				attachments: [{
					fallback: req.body.html + " [ <http://wikiwiki.winak.be/index.php/" + req.body.text + "|" + req.body.text + ">]",
					color: "#36a64f", // Can either be one of 'good', 'warning', 'danger'
					thumb_url: "http://www.winak.be/sites/default/files/WINAK%20Schild%20ZW-OR.png",
					text: html
				}]
			};
			
			slack.notify(messages);
		}
		res.send('');
	});

	// function(error, result) {
	// 		console.log(result.body);
	// 		var text = htmlToText.fromString(result.body, {
	// 			wordwrap: 130
	// 		});
	// 		console.log(text);
	// 		response.send('test');
	// 	});

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
