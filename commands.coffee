request = require 'request'
_ = require 'lodash'
{slack} = require './common.js'

module.exports = (app) ->
  app.post '/isitup', (req, res) ->
    website = req.body.text
    return res.send "Try /isitup [domain]" if website.length is 0
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

      # Status code can take on 3 different values
      message.text = switch body.status_code
        when 1 then "*#{website} is up and running.*"
        when 2 then "*#{website} seems to be down at the moment.*"
        when 3 then "*I don't think '#{website}' is even a website...*"
      slack.notify message
      res.end()

  MAX_CATS = 300
  app.post '/cat', (req, res) ->
    request
      url: 'http://catoverflow.com/api/query'
      qs:
        offset: _.random 0, MAX_CATS
        limit: 1
    , (err, catResponse, body) ->
      message =
        text: body
        channel: '#' + req.body.channel_name
      slack.notify message
      res.end()
