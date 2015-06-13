var Slack = require('node-slackr');

module.exports = {
  slack: new Slack('https://hooks.slack.com/services/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', {
    channel: "#neejberhood",
    username: "trogdor",
    icon_url: "http://i.stack.imgur.com/ihN3m.png"
  })
};
