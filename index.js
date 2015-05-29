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

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

app.post('/calendar', urlencodedParser, function(req, res) {
	requestLib.get('http://www.google.com/calendar/feeds/winak.be_jdku0e5md1sildhoom7225f9r4%40group.calendar.google.com/public/basic?orderby=starttime&sortorder=ascending&futureevents=true&alt=json', function(error, response, body) {
		var google = JSON.parse(body);
		messages = {
			text: "WINAK Calendar",
			channel: "#neejberhood",
			attachments: []
		};

		for (var i in google.feed.entry) {
			console.log(google.feed.entry[i].title.$t);
			
			messages.attachments.push({
				fallback: google.feed.entry[i].title.$t,
				color: getRandomColor(), // Can either be one of 'good', 'warning', 'danger'
				title: google.feed.entry[i].title.$t,
				text: htmlToText.fromString(google.feed.entry[i].summary.$t)
			});
		}
		
		slack.notify(messages);		
		
		res.send('');
	});
});

app.post('/wikiwiki', urlencodedParser, function(req, res) {

	//slack.notify(messages);
	requestLib.get('http://wikiwiki.winak.be/index.php/' + req.body.text, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			$ = cheerio.load(body);
			var text = htmlToText.fromString($('#bodyContent').html(), {});
			console.log(text);
			//slack.notify(text);

			var html = text.replace(
				new RegExp("\\n--------------------------------------------------------------------------------\\n", "g"),
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

});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
