Slack = require('node-slackr');
var slack = new Slack('https://hooks.slack.com/services/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', {
	channel: "#neejberhood",
	username: "trogdor",
	icon_url: "http://i.stack.imgur.com/ihN3m.png"
})
var swanson = new Slack('https://hooks.slack.com/services/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', {
	channel: "#neejberhood",
	username: "ron.swanson",
	icon_url: "http://s3-ak.buzzfeed.com/static/enhanced/webdr05/2013/7/21/18/original-16475-1374446648-13.jpg"
})
var express = require('express');
var bodyParser = require('body-parser');
var htmlToText = require('html-to-text');
var requestLib = require('request');
var cheerio = require('cheerio');
var app = express();
var pg = require('pg');

var urlencodedParser = bodyParser.urlencoded({
	extended: false
})

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}
app.post('/swanson', urlencodedParser, function(req, res) {
	requestLib.get('http://ron-swanson-quotes.herokuapp.com/quotes', function(error, response, body) {
		var ronquote = JSON.parse(body);
		swanson.notify(ronquote.quote);
	});
});

app.post('/giphy', urlencodedParser, function(req, res) {
	var giphy = require('giphy')('dc6zaTOxFJmzC');

	giphy.search({q : req.body.text, limit : 25}, function(e, handleSearch, r) {
		console.log(handleSearch);
		if (handleSearch.data.length > 0) {
		var random_int = randomInt(0, handleSearch.data.length);
		messages = {
			text: req.body.user_name + ": " + req.body.text + "\n" + handleSearch.data[random_int].url,
			channel: "#" + req.body.channel_name,
			attachments: []
		};
		
		slack.notify(messages);
		res.send('');
		} else {
			res.send('No gifs found');
		}
	});
});

function handleSearch(err, handleSearch, res) {
	console.log(handleSearch);
}


app.post('/slap', urlencodedParser, function(req, res) {
	if (req.body.user_name == req.body.text) {
		res.send('You can\'t slap yourself silly.');
	} else {

		var selectquery = 'SELECT * FROM slap_variations;';

		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			client.query(selectquery, function(err, result) {
				done();
				if (err) {
					res.send(err);
				} else {
					if (result.rows.length > 0) {
						var random_int = randomInt(0, result.rows.length);
						var slap_message = result.rows[random_int].slap;
						slap_message = slap_message.replace("name1", req.body.user_name);
						slap_message = slap_message.replace("name2", req.body.text);
						messages = {
							text: "*" + slap_message + "*",
							channel: "#" + req.body.channel_name
						};
						slack.notify(messages);
						res.send("");
					}
				}
			});

		});
	}
});


app.post('/addslap', urlencodedParser, function(req, res) {

	var sentence = req.body.text;
	if (sentence.indexOf("name1") > -1) {
		if (sentence.indexOf("name2") > -1) {
			var addquery = 'INSERT INTO slap_variations (slap) VALUES (\'' + sentence + '\');';

			pg.connect(process.env.DATABASE_URL, function(err, client, done) {
				client.query(addquery, function(err, result) {
					done();
					if (err) {
						res.send(err);
					} else {
						res.send('SUCCES: Your slap has been added.');
					}
				});

			});
		} else {
			res.send('FAILED: your slap sentence did not contain \'name2\'');
		}
	} else {
		res.send('FAILED: your slap sentence did not contain \'name1\'');
	}
});

app.post('/meme', urlencodedParser, function(req, res) {
	var arguments = [];
	if (req.body.text != "") {
		arguments = req.body.text.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
		console.log(arguments);
	}

	if (arguments.length == 3) {

		requestLib.post({
			url: 'https://api.imgflip.com/caption_image',
			form: {
				username: 'slimmiii',
				password: 'testbunniesyay',
				text0: arguments[1].replace(/['"]+/g, ''),
				text1: arguments[2].replace(/['"]+/g, ''),
				template_id: arguments[0]
			}
		}, function(err, httpResponse, body) {
			var meme = JSON.parse(body);
			console.log(meme.data.url);

			messages = {
				text: "Meme Generator [" + req.body.user_name + "]\n" + meme.data.url,
				channel: "#" + req.body.channel_name,
				attachments: []
			};

			slack.notify(messages);
			res.send('');


		})
	} else {
		requestLib.get('https://api.imgflip.com/get_memes', function(error, response, body) {
			var memes = JSON.parse(body);
			var buffer = "Usage:\n/meme ID \"your top text here\" \"your bottom text here\"\n\n";
			for (var i in memes.data.memes) {
				var meme = memes.data.memes[i];
				buffer += meme.name + " [" + meme.id + "]\n";
			}

			res.send(buffer);
		});

	}
});

app.post('/calendar/winak', urlencodedParser, function(req, res) {
	requestLib.get('http://www.google.com/calendar/feeds/winak.be_jdku0e5md1sildhoom7225f9r4%40group.calendar.google.com/public/basic?orderby=starttime&sortorder=ascending&futureevents=true&alt=json', function(error, response, body) {
		var google = JSON.parse(body);
		messages = {
			text: "WINAK Kalender",
			channel: "#" + req.body.channel_name,
			attachments: []
		};

		for (var i in google.feed.entry) {
			console.log(google.feed.entry[i].title.$t);
			var text = htmlToText.fromString(google.feed.entry[i].summary.$t);
			text = text.substring(0, text.lastIndexOf("\n"));


			messages.attachments.push({
				fallback: google.feed.entry[i].title.$t,
				color: getRandomColor(), // Can either be one of 'good', 'warning', 'danger'
				title: google.feed.entry[i].title.$t,
				text: text
			});
		}

		slack.notify(messages);

		res.send('');
	});
});

app.post('/calendar/neejberhood', urlencodedParser, function(req, res) {
	requestLib.get('http://www.google.com/calendar/feeds/epo9gispro34af2goam9dekscg%40group.calendar.google.com/public/basic?orderby=starttime&sortorder=ascending&futureevents=true&alt=json', function(error, response, body) {
		var google = JSON.parse(body);
		messages = {
			text: "Neejberhood Kalender",
			channel: "#" + req.body.channel_name,
			attachments: []
		};

		for (var i in google.feed.entry) {
			console.log(google.feed.entry[i].title.$t);
			var text = htmlToText.fromString(google.feed.entry[i].summary.$t);
			text = text.substring(0, text.lastIndexOf("\n"));


			messages.attachments.push({
				fallback: google.feed.entry[i].title.$t,
				color: getRandomColor(), // Can either be one of 'good', 'warning', 'danger'
				title: google.feed.entry[i].title.$t,
				text: text
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

function parseQuote(quote, req, curQuote, totalQuotes) {
	messages = {
		text: "[" + quote.id + "] " + quote.quote,
		channel: ["#" + req.body.channel_name]
	}
	if (typeof curQuote != 'undefined'){
	    messages.text += "(Quote " + curQuote + " of " + totalQuotes + ")";
	}
	return messages;
}

app.post('/lastquote', urlencodedParser, function(req, res) {
    
	pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		client.query('select * from quotes order by id desc limit 1;', function(err, result) {
			done();
			if (err) {
				console.error(err);
				res.send("Error " + err);
			} else {
				if (result.rows.length > 0) {
					slack.notify(parseQuote(result.rows[0], req));
					res.send("");
				} else {
					res.send("There were no quotes available");
				}
			}
		});
	});

});

app.post('/quote', urlencodedParser, function(req, res) {
	console.log(process.env.DATABASE_URL);
	var id = req.body.text;

	if (/^\+?\d+$/.test(id)) {
	    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		client.query('SELECT * FROM quotes WHERE id = $1', [id], function(err, result) {
		done();
		if (err) {
			console.error(err);
			res.send("Error " + err);
		} else {
			if (result.rows.length > 0) {
				slack.notify(parseQuote(result.rows[0], req));
				res.send("");
			} else {
				res.send("I'm sorry this quote could not be found!");
			}
		}
		});
	    });
	} else if (/^[A-Za-z0-9,;!'"\s]+$/.test(id)){
	    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
		client.query('SELECT * FROM quotes WHERE quote LIKE $1',["%" + id + "%"], function(err, result) {
		    done();
		    if (err) {
			    console.error(err);
			    res.send("Error " + err);
		    } else {
			    if (result.rows.length > 0) {
				    var pos = randomInt(0, result.rows.length-1);
				    slack.notify(parseQuote(result.rows[pos], req, pos, result.rows.length));
				    res.send("");
			    } else {
				    res.send("I'm sorry this quote could not be found!");
			    }
		    }
		});
	    });
	} else {
		res.send("Error: Invalid command. Either use '/quote <id>' of '/quote <text>'");
	}
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
