request = require 'request'
_ = require 'lodash'
{slack} = require './common.js'
Slack = require 'node-slackr'

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
      return res.send "Catoverflow seems to be down for the moment :(" if err or body.length is 0
      message =
        text: body
        channel: '#' + req.body.channel_name
      slack.notify message
      res.end()


  yoda = new Slack 'https://hooks.slack.com/services/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',
    channel: "#neejberhood"
    username: "yoda"
    icon_url: "http://animockery.files.wordpress.com/2014/03/yoda-02.png"

  # totally nicked this
  yodaQuotes = [
    "Agree with you, the council does. Your apprentice, Skywalker will be.",
    "Always two there are, no more, no less: a master and an apprentice.",
    "Fear is the path to the Dark Side. Fear leads to anger, anger leads to hate; hate leads to suffering. I sense much fear in you.",
    "Qui-Gon's defiance I sense in you.",
    "Truly wonderful the mind of a child is.",
    "Around the survivors a perimeter create.",
    "Lost a planet Master Obi-Wan has. How embarrassing. how embarrassing.",
    "Victory, you say? Master Obi-Wan, not victory. The shroud of the Dark Side has fallen. Begun the Clone War has.",
    "Much to learn you still have...my old padawan... This is just the beginning!",
    "Twisted by the Dark Side young Skywalker has become.",
    "The boy you trained, gone he is, consumed by Darth Vader.",
    "The fear of loss is a path to the Dark Side.",
    "If into the security recordings you go, only pain will you find.",
    "Not if anything to say about it I have.",
    "Great warrior, hmm? Wars not make one great.",
    "Do or do not; there is no try.",
    "Size matters not. Look at me. Judge me by my size, do you?",
    "That is why you fail.",
    "No! No different. Only different in your mind. You must unlearn what you have learned.",
    "Always in motion the future is.",
    "Reckless he is. Matters are worse.",
    "When nine hundred years old you reach, look as good, you will not.",
    "No. There is... another... Sky... walker..."
  ]


  app.post '/yoda', (req, res) ->
    # If no translation required, spam a random quote
    unless req.body.text or req.body.text?.length
      yoda.notify
        text: _.sample yodaQuotes
        channel: '#' + req.body.channel_name
      return res.end()

    # If translation required, ask the yoda API
    request
      url: 'https://yoda.p.mashape.com/yoda'
      qs: sentence: req.body.text
      headers:
        'X-Mashape-Key': 'AeUvEe9PcpmshXFvhYtLy8q06WtPp1EwhKTjsnZG3XYR00epBQ'
        Accept: 'text/plain'
    , (err, yodaResponse, body) ->
      return res.send "No... no. Yoda no es home" if err
      yoda.notify
        text: body
        channel: '#' + req.body.channel_name
      res.end()

