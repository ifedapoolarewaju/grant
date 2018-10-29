
var express = require('express')
var session = require('express-session')
var grant = require('grant-express')
var RedisStore = require('connect-redis')(session)

var config = require('./config.json')


express()
  .use(session({
    store: new RedisStore(),
    secret: 'grant', saveUninitialized: true, resave: true
  }))
  .use(grant(config))
  .get('/facebook_callback', (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .get('/twitter_callback', (req, res) => {
    res.end(JSON.stringify(req.session.grant.response, null, 2))
  })
  .listen(3000, () => console.log(`Express server listening on port ${3000}`))
