const Dotenv = require('dotenv')

Dotenv.config()

const Botkit = require('botkit')
const {createCart, searchItems} = require('./src/amazon')
const createStorage = require('./src/firebase_storage')

createStorage({
  firebase_uri: process.env.FIREBASE_URI,
  firebase_secret: process.env.FIREBASE_SECRET,
  uid: '1',
  expire: 3000000000
}, (storage) => {

  const controller = Botkit.slackbot({
    debug: false,
    storage
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

  controller.hears(['register ([^ ]+) ([^ ]+)'], 'direct_message,direct_mention,mention', (bot, message) => {
    controller.storage.teams.save({id: message.match[1], value: message.match[2]}, err => {
      if (err) {
        bot.reply(message, '```' + err.toString() + '```')
      } else {
        bot.reply('Data successfully saved!')
      }
    })
  })

  controller.hears(['buy (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    controller.storage.teams.get(message.match[1], (err, data) => {
      if (err) {
        bot.reply(message, '```' + err.toString() + '```')
      } else if (data && data.value) {
        createCart(data.value).then(res => {
          bot.reply(message, `Checkout: ${res.purchase_url}`)
          bot.reply(message, `If you are using mobile phone, visit here: ${res.mobile_cart_url}`)
        })
        .catch(err => {
          bot.reply(message, '```' + err.stack + '```')
        })
      } else {
        bot.reply(message, 'Available data not found.')
      }
    })
  })

})
