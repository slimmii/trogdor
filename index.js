Slack = require('node-slackr');
var slack = new Slack('https://hooks.slack.com/services/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', {
	channel: "#neejberhood",
	username: "trogdor",
	icon_url: "http://i.stack.imgur.com/ihN3m.png"
})
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.post('/wikiwiki', urlencodedParser, function(request, response) {
	messages = {
	  text: "WINAK WikiWiki",
	  channel: "#neejberhood",
	  attachments: [
	    {
	      fallback: request.body.text + " [ <http://wikiwiki.winak.be/index.php/" + request.body.text + "|" + request.body.text + ">]",
	      color: "#36a64f", // Can either be one of 'good', 'warning', 'danger'
		  thumb_url : "http://www.winak.be/sites/default/files/WINAK%20Schild%20ZW-OR.png",
	      fields: [
	        {
	          title: request.body.text,
	          value: "This wiki wiki page is pretty awesome <http://wikiwiki.winak.be/index.php/" + request.body.text + "|" + request.body.text + ">",
	          short: false 
	        }
	      ]
	    }
	  ]
	};
	slack.notify(messages);

	response.send('');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
