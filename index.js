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
	slack.notify(request.body.user_name + " would like you to read <http://wikiwiki.winak.be/index.php/" + request.body.text + "|" + request.body.text + "> on the WINAK WikiWiki!");

	response.send('');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
