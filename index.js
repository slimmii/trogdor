var request = require('request');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.post('/wikiwiki', function(request, response) {
  response.send('Herro World!');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
