const Dotenv = require('dotenv')

Dotenv.config()

const Botkit = require('botkit')
const {searchItems} = require('./src/amazon')

const controller = Botkit.slackbot({
  debug: false
})

controller.spawn({
  token: process.env.SLACK_API_TOKEN
}).startRTM()

controller.hears(['search (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
  searchItems(message.match[1]).then(attachments => {
    bot.reply(message, {attachments})
  })
  .catch(err => {
    bot.reply(message, '```' + err.stack + '```')
  })
})
