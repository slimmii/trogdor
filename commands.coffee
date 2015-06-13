request = require 'request'
{slack} = require './common.js'

module.exports = (app) ->
  app.post '/isitup', (req, res) ->
    website = req.body.text
    request
      url: "http://isitup.org/#{website}.json"
      headers:
        'User-Agent': 'Neejberhood Trogdor Bot'
    , (err, isitupResponse, body) ->
      return res.send('Something bad happened while checking isitup...') if err
      body = JSON.parse body
      message =
        text: null
        channel: '#' + req.body.channel_name
      message.text = switch body.status_code
        when 1 then "*#{website} is up and running.*"
        when 2 then "*#{website} seems to be down at the moment.*"
        when 3 then "*I don't think '#{website}' is even a website...*"
      slack.notify message
      res.end()

